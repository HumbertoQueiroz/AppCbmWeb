import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Dimensions, Switch } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};

const IncidentResponses = ({ occurrenceId, onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState([]);
  // action modal
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [actionDescription, setActionDescription] = useState('');
  const [sendingAction, setSendingAction] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  // id da resposta (incident response) selecionada para anexar o status
  const [selectedIncidentResponseId, setSelectedIncidentResponseId] = useState(null);
  // flags para indicar tipos de horários (serão enviados como true se marcados)
  const [markArrivalOccurrence, setMarkArrivalOccurrence] = useState(false);
  const [markArrivalHospital, setMarkArrivalHospital] = useState(false);
  const [markReturnVehicle, setMarkReturnVehicle] = useState(false);
  
  const fetchResponses = async () => {
    if (!occurrenceId) {
      setError('occurrenceId não informado');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const email = encodeURIComponent(user?.email || '');
      const url = `https://cbm-app-6qeks.ondigitalocean.app/incident-response/${occurrenceId}/responses${email ? `?email=${email}` : ''}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        const txt = await resp.text().catch(() => resp.statusText);
        throw new Error(txt || `HTTP ${resp.status}`);
      }
      const data = await resp.json().catch(() => null);
      if (Array.isArray(data)) setResponses(data);
      else setResponses([]);
    } catch (e) {
      console.error('Falha ao buscar incident responses', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occurrenceId, user?.email]);

  const openActionModal = (incidentResponseId = null) => {
    setSelectedStatus(null);
    setActionDescription('');
    setShowStatusOptions(false);
    setSelectedIncidentResponseId(incidentResponseId);
    // reset flags ao abrir modal
    setMarkArrivalOccurrence(false);
    setMarkArrivalHospital(false);
    setMarkReturnVehicle(false);
    setActionModalVisible(true);
  };

  const sendActionStatus = async () => {
    if (!selectedStatus) {
      Alert.alert('Preencha', 'Selecione um tipo de ação.');
      return;
    }

    // no need to attach to an existing response; incidentResponseId will be null unless backend expects otherwise

    setSendingAction(true);
    try {
      // preparar descrição: se algum switch estiver ativo, prefixar texto do switch + nova linha
      let finalDescription = actionDescription || '';
      if (markArrivalOccurrence) {
        finalDescription = `Horário de chegada ao local da ocorrência\n${finalDescription}`;
      } else if (markArrivalHospital) {
        finalDescription = `Horário de chegada ao hospital\n${finalDescription}`;
      } else if (markReturnVehicle) {
        finalDescription = `Horário de retorno do veículo ao quartel\n${finalDescription}`;
      }

      const payload = {
        statusIncidentResponse: selectedStatus,
        // enviar o id da resposta selecionada (pode ser null se criar um novo atendimento)
        incidentResponseId: selectedIncidentResponseId,
        description: finalDescription,
        email: user?.email || ''
      };

      // incluir flags de horários como true quando marcadas (mantém comportamento anterior)
      if (markArrivalOccurrence) payload.dateArrivalOccurrence = true;
      if (markArrivalHospital) payload.dateArrivalHospital = true;
      if (markReturnVehicle) payload.dateReturn = true;

      const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/create-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => resp.statusText);
        Alert.alert('Erro', 'Falha ao enviar: ' + (txt || resp.status));
        return;
      }

      await resp.json().catch(() => null);
      Alert.alert('Sucesso', 'Status criado com sucesso');
      setActionModalVisible(false);
      // refresh list
      fetchResponses();
    } catch (e) {
      console.error('Erro ao criar status', e);
      Alert.alert('Erro', 'Falha ao criar status: ' + (e.message || e));
    } finally {
      setSendingAction(false);
    }
  };

  const renderVehicle = (v) => {
    if (!v) return null;
    const veh = v.vehicle || {};
    return (
      <View style={styles.vehicleRow} key={v.id || veh.id}>
        <Text style={styles.vehTitle}>{veh.placa || veh.plate || '-'} • {veh.type || '-'}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View key={item.id}>
      <View style={[styles.bgWhite,styles.card]}>
        <Text style={styles.cardTitle}>Atendimento número: {item.id}</Text>
        <View style={{position:'absolute', right:12, top:12}}>
          <TouchableOpacity style={[styles.btn, {paddingHorizontal:8, paddingVertical:6}]} onPress={() => openActionModal(item.id)}>
            <Text style={styles.btnText}>Registrar nova interação</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sub}>Iniciado em: {formatDate(item.dateInit)}</Text>
        <View style={styles.section}>        
        {item.userResponse ? (
          <View>
            <Text>Atendente: {item.userResponse.userName}</Text>
          </View>
        ) : (
          <Text>-</Text>
        )}
      </View>
        {item.dateArrivalOccurrence && <Text style={styles.sub}>Chegada ocorrência: {formatDate(item.dateArrivalOccurrence)}</Text>}
      </View>
      {item.incidentVehicles &&
        <View style={[styles.card, styles.bgWhite]}>
          <Text style={styles.sectionTitle}>Veículos Despachados:</Text>
          <View style={{gap: 8, flexDirection:'row'}}>
            {Array.isArray(item.incidentVehicles) && item.incidentVehicles.length > 0 ? (
              item.incidentVehicles.map((iv) => renderVehicle(iv))
            ) : (
              <Text>-</Text>
            )}
          </View>
          <Text style={[styles.sub, {marginVertical:4}]}>Início deslocamento do(s) veículo(s): {formatDate(item.dateStartDisplacement)}</Text>
        </View>            
      }
      <View style={[styles.card, styles.bgWhite]}>
        <Text style={styles.sectionTitle}>Histórico:</Text>
        {Array.isArray(item.Status) && item.Status.length > 0 ? (
          item.Status.map((s) => (
            <View key={s.id} style={[styles.statusRow, styles.vehicleRow ]}>
              <Text style={styles.statusTitle}>{s.statusIncidentResponse} — {formatDate(s.date)}</Text>
              <Text style={styles.statusDesc}>Descrição: {s.description || '-'}</Text>
            </View>
          ))
        ) : (
          <Text>-</Text>
        )}
      </View>      
    </View>
  );

  if (!occurrenceId) {
    return (
      <View style={styles.container}>
        <Text>Informe uma ocorrência para visualizar respostas.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Respostas da Ocorrência #{occurrenceId}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={fetchResponses}>
            <Text style={styles.btnText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Action modal */}
      <Modal
        visible={actionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Ação {selectedIncidentResponseId ? `- Atendimento ${selectedIncidentResponseId}` : ''}</Text>

            <Text style={{fontWeight:'600', marginBottom:6}}>Selecione o tipo:</Text>
            <TouchableOpacity style={styles.dropButton} onPress={() => setShowStatusOptions((v) => !v)}>
              <Text>{selectedStatus || 'Selecione...'}</Text>
            </TouchableOpacity>
            {showStatusOptions && (
              <View style={{borderWidth:1, borderColor:'#eee', borderRadius:6, marginTop:6, overflow:'hidden'}}>
                {['COMUNICACAO','OBSERVACAO','LIGACAO'].map((s) => (
                  <TouchableOpacity key={s} style={[styles.option, selectedStatus === s ? styles.optionSelected : null]} onPress={() => { setSelectedStatus(s); setShowStatusOptions(false); }}>
                    <Text style={{fontWeight:'600'}}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            
            <View style={{marginTop:8}}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Horário de chegada ao local da ocorrência</Text>
                  <Switch value={markArrivalOccurrence} onValueChange={(v) => {
                    // se ativando, desativa os outros
                    if (v) {
                      setMarkArrivalHospital(false);
                      setMarkReturnVehicle(false);
                    }
                    setMarkArrivalOccurrence(v);
                  }} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Horário de chegada ao hospital</Text>
                  <Switch value={markArrivalHospital} onValueChange={(v) => {
                    if (v) {
                      setMarkArrivalOccurrence(false);
                      setMarkReturnVehicle(false);
                    }
                    setMarkArrivalHospital(v);
                  }} />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Horário de retorno do veículo ao quartel</Text>
                  <Switch value={markReturnVehicle} onValueChange={(v) => {
                    if (v) {
                      setMarkArrivalOccurrence(false);
                      setMarkArrivalHospital(false);
                    }
                    setMarkReturnVehicle(v);
                  }} />
              </View>
            </View>

            <Text style={{fontWeight:'600', marginTop:8}}>Descrição</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Descrição da ação"
              value={actionDescription}
              onChangeText={setActionDescription}
              multiline
            />

            <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 12}}>
              <TouchableOpacity style={[styles.sendActionBtn, sendingAction ? styles.sendActionBtnDisabled : null]} onPress={sendActionStatus} disabled={sendingAction}>
                <Text style={styles.sendActionBtnText}>{sendingAction ? 'ENVIANDO...' : 'ENVIAR'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setActionModalVisible(false)}>
                <Text style={styles.cancelBtnText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <View style={styles.errorBox}><Text style={{color:'#900'}}>{error}</Text></View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 40}}
          ListEmptyComponent={<Text>Nenhuma resposta encontrada.</Text>}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, minHeight: '100%', minWidth: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12, flex:9  },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 8 },
  btnSecondary: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { padding: 12, borderRadius: 8, marginBottom: 12 },
  bgWhite:{ backgroundColor: 'rgba(254, 254, 254, 0.6)' },
  cardTitle: { fontWeight: '700', marginBottom: 6 },
  sub: { color: '#555', marginBottom: 4 },
  section: { marginTop: 8 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  vehicleRow: { padding: 8, borderRadius:6, marginRight:8, backgroundColor:'rgba(255, 255, 255, 0.6)' },
  vehTitle: { fontWeight: '600' },
  vehMeta: { color: '#444', fontSize: 12 },
  statusRow: { marginBottom: 6 },
  statusTitle: { fontWeight: '600', marginVertical:4 },
  statusDesc: { color: '#333' },
  errorBox: { padding: 12, borderRadius: 6, backgroundColor: '#ffecec' },
  /* modal / action styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  option: { paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionSelected: { backgroundColor: 'rgba(0,123,255,0.1)' },
  descriptionInput: { marginTop: 6, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, height: Math.round(Dimensions.get('window').height * 0.3), textAlignVertical: 'top', backgroundColor: '#fafafa' },
  sendActionBtn: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sendActionBtnDisabled: { backgroundColor: '#8ab4ff' },
  sendActionBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { backgroundColor: '#ddd', alignItems: 'center', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 18 },
  cancelBtnText: { fontWeight: '700' },
  dropButton: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, backgroundColor: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6 },
  switchLabel: { fontWeight: '600' },
});

export default IncidentResponses;

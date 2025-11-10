import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Span from '../components/Span';

const formatCPF = (v) => {
  if (v === null || v === undefined) return '-';
  const s = String(v);
  if (s.length < 11) return s; // don't try to format
  return `${s.slice(0,3)}.${s.slice(3,6)}.${s.slice(6,9)}-${s.slice(9,11)}`;
};

const formatField = (key, value) => {
  if (value === null || value === undefined) return '-';
  if (key.toLowerCase().includes('cpf')) return formatCPF(value);
  return String(value);
};

const DetalheOcorrencia = ({ item, onBack }) => {
  const data = item || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [noVehicleSelected, setNoVehicleSelected] = useState(false);
  const [sending, setSending] = useState(false);
  const [observation, setObservation] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const openModal = async () => {
    setObservation('');
    setConfirmVisible(false);
    setModalVisible(true);
    await fetchVehicles();
  };

  const handleContinue = () => {
    // must have at least one vehicle selected or the noVehicle option
    if (!noVehicleSelected && selectedVehicleIds.length === 0) {
      alert('Selecione ao menos um veículo ou escolha "Sem deslocamento de veículo"');
      return;
    }
    // move to confirm modal
    setModalVisible(false);
    setConfirmVisible(true);
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
  const email = encodeURIComponent(user?.email || '');
  const url = `https://cbm-app-6qeks.ondigitalocean.app/list-vehicles${email ? `?email=${email}` : ''}`;
  const resp = await fetch(url);
      if (!resp.ok) {
        console.warn('Erro ao buscar veículos:', resp.status);
        setVehicles([]);
        setLoading(false);
        return;
      }
      const data = await resp.json().catch(() => null);
      console.log(data)
      if (Array.isArray(data)) setVehicles(data);
      else setVehicles([]);
    } catch (e) {
      console.warn('Falha ao buscar veículos:', e);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    // toggle selection logic
    if (!item) return;
    if (item.noVehicle) {
      // toggle no-vehicle option: when selected, clear other selections
      const next = !noVehicleSelected;
      setNoVehicleSelected(next);
      if (next) setSelectedVehicleIds([]);
      return;
    }

    // if we had no-vehicle selected, unselect it when choosing a real vehicle
    if (noVehicleSelected) setNoVehicleSelected(false);

  const id = item.id || item.plate || item.placa || `${item.name}`;
      if (!id) return;
    setSelectedVehicleIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const renderVehicle = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, (noVehicleSelected && item.noVehicle) || (!item.noVehicle && selectedVehicleIds.includes(item.id)) ? styles.itemSelected : null]}
      onPress={() => handleSelect(item)}
    >
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={styles.itemText}>{item.plate || item.placa || item.displayName || item.name || 'Veículo'}</Text>
        <Text>{(item.noVehicle && noVehicleSelected) ? '✓' : (!item.noVehicle && selectedVehicleIds.includes(item.id) ? '✓' : '')}</Text>
      </View>
      {item.type ? <Text style={styles.itemSub}>Tipo: {item.type}</Text> : null}
      {item.model ? <Text style={styles.itemSub}>Modelo: {item.model}</Text> : null}
      {item.description ? <Text style={styles.itemSub}>Descrição: {item.description}</Text> : null}
    </TouchableOpacity>
  );

  const handleSend = async () => {
    // must have at least one vehicle selected or the noVehicle option
    if (!noVehicleSelected && selectedVehicleIds.length === 0) {
      alert('Selecione ao menos um veículo ou escolha "Sem deslocamento de veículo"');
      return;
    }

    setSending(true);
    try {
      // convert ids to numbers when possible
      const vehicleIds = noVehicleSelected ? [] : selectedVehicleIds.map((id) => {
        const n = Number(id);
        return Number.isNaN(n) ? id : n;
      }).filter((v) => v !== undefined && v !== null);

      const payload = {
        email: user?.email || '',
        occurrenceId: Number(data.id) || data.id,
        vehicleIds,
        statusOccurrence: 'ATENDENDO',
        // include single observation field provided by the user
        description: observation || '',
      };

      const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/respond-occurrence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => resp.statusText);
        alert('Erro no envio: ' + (text || resp.status));
        // keep confirm modal open so user can retry
        return;
      }

      const respData = await resp.json().catch(() => null);
      // close confirm modal and show success popup, then redirect to inicial
      setConfirmVisible(false);
      alert('Registrado Despacho inicial com sucesso');
      // limpa estados locais
      setObservation('');
      setSelectedVehicleIds([]);
      setNoVehicleSelected(false);
      console.log('respond-occurrence response', respData);
      // após o usuário fechar o alerta, redireciona para a tela inicial (via onBack)
      try {
        if (typeof onBack === 'function') onBack();
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Falha ao enviar resposta', e);
      alert('Falha ao enviar resposta: ' + (e.message || e));
    } finally {
      setSending(false);
    }
  };

  const listData = [{ id: 'none', displayName: 'Sem deslocamento de veículo', noVehicle: true }, ...vehicles.map((v, idx) => ({ id: v.id || `v-${idx}`, ...v }))];
  // derive selected vehicle objects for display in confirmation
  const selectedVehicles = selectedVehicleIds
    .map((id) => vehicles.find((v) => String(v.id) === String(id) || String(v.plate) === String(id) || String(v.placa) === String(id) || String(v.name) === String(id)))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detalhe da Ocorrência numero: {data.id}</Text>
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backButton}>
          <Text style={[styles.backText]}>Voltar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.card}>
          <View style={styles.list}>
            {Object.keys(data).length === 0 ? (
              <View style={styles.row}>
                <Text style={styles.key}>-</Text>
                <Text style={styles.value}>-</Text>
              </View>
            ) : (
              <View style={styles.list}>
                <View style={[styles.ContainerRow]} >
                  <Text style={styles.textSecondaryTitle}>Informante: {data.userName}</Text>
                  <View style={styles.rowPai}>
                    <View style={[styles.row]}>
                      <Text style={styles.key}>CPF: </Text>
                      <Text style={styles.value}>{formatField('cpf', data.cpf)} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>E-mail: </Text>
                      <Text style={styles.value}>{formatField('email', data.email)} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>Telefone: </Text>
                      <Text style={styles.value}>{formatField('phone', data.phone)} </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.key}>Endereço: </Text>
                    <Text style={styles.value}>{`${data.addressStreet ? `${data.addressStreet}, ` : ''}${data.addressNumber? `Número: ${data.addressNumber}, ` : ''}${data.addressDistrict? `Bairro: ${data.addressDistrict}, ` : ''}${data.user_addressCity? `Cidade: ${data.user_addressCity}, ` : ''}${data.user_addressState? `Estado: ${data.user_addressState}.` : ''}`} </Text>
                  </View>
                </View>
                <View style={[styles.ContainerRow]} >
                  <Text style={styles.textSecondaryTitle}>Ocorrência: {data.natOco}</Text>
                  <View style={[styles.rowPai]}>
                    <View style={styles.row}>
                      <Text style={styles.key}>Descrição: </Text>
                      <Text style={styles.value}>{ data.description} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>Endereço da ocorrência: </Text>
                      <Text style={styles.value}>{`${data.addressLog ? `${data.addressLog}, ` : ''}${data.addressNum? `Número: ${data.addressNum}, ` : ''}${data.addressComp ? `Complemento: ${data.addressComp}, ` : ''}${data.addressBairro? `Bairro: ${data.addressBairro}, ` : ''}${data.addressCity? `Cidade: ${data.addressCity}, ` : ''}${data.addressState? `Estado: ${data.addressState}, ` : ''}${data.addressCEP? `CEP: ${data.addressCEP}.` : ''}`} </Text>
                    </View>
                  </View>                  
                </View>
                {data.hasVictim && (
                   <View style={[styles.ContainerRow]} >
                      <Text style={styles.textSecondaryTitle}>Vítima(s): {data.natOco}</Text>
                      <View style={[styles.rowPai]}>
                        <View style={styles.row}>
                          <Text style={styles.key}>Quantidade de Vítima: </Text>
                          <Text style={styles.value}>{data.victimsQuantity}</Text>
                        </View>
                         <View style={styles.row}>
                        <Text style={styles.key}>Estado da(s) Vítima(s): </Text>
                        <Text style={styles.value}>{data.conditionVictim}</Text>
                      </View>
                      </View>
                     
                    </View>
                )}
              </View>
            )}
          </View>
        </View>
        <Span />
        {data.statusOccurrence==="REGISTRADO" && (
          <View style={{width:'100%', justifyContent:'center', alignItems:'center' }}>
            <View style={[styles.backButton, {backgroundColor:'#ff0000'}]}>
              <TouchableOpacity style={styles.dispatchButton} onPress={openModal}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>DESPACHAR VEÍCULO</Text>
              </TouchableOpacity>
            </View>

            {/* Vehicles selection modal */}
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => { setModalVisible(false); setSelectedVehicleIds([]); setNoVehicleSelected(false); }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Escolha um veículo</Text>
                  {loading ? (
                    <ActivityIndicator size="large" color="#ff0000" />
                  ) : (
                    <FlatList
                      data={listData}
                      keyExtractor={(item, index) => item.id || item.plate || item.placa || String(index)}
                      renderItem={renderVehicle}
                    />
                  )}

                  <View style={{flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'center'}}>
                    <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                      <Text style={styles.continueBtnText}>CONTINUAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={() => { setModalVisible(false); setObservation(''); setSelectedVehicleIds([]); setNoVehicleSelected(false); }}>
                      <Text style={styles.closeBtnText}>FECHAR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Confirmation modal with observation and send */}
            <Modal
              visible={confirmVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => { setConfirmVisible(false); setModalVisible(true); }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Confirmar despacho</Text>
                  <View style={{marginBottom:8}}>
                    <Text style={{fontWeight: '600', marginBottom: 6}}>Veículos selecionados:</Text>
                    {selectedVehicles.length > 0 ? (
                      selectedVehicles.map((v, idx) => (
                        <Text key={v.id || `${idx}`} style={{marginBottom:4}}>Placa: {v.plate || v.placa || '-'} • Tipo: {v.type || '-'}</Text>
                      ))
                    ) : (
                      <Text>Nenhum (Sem deslocamento)</Text>
                    )}
                  </View>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Descrição do início do atendimento"
                    value={observation}
                    onChangeText={setObservation}
                    multiline
                  />

                  <View style={{flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'center'}}>
                    <TouchableOpacity style={[styles.sendBtn, sending ? styles.sendBtnDisabled : null]} onPress={handleSend} disabled={sending}>
                      {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>ENVIAR</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={() => { setConfirmVisible(false); setModalVisible(true); }}>
                      <Text style={styles.closeBtnText}>VOLTAR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,},
  header: { flexDirection: 'row', alignItems: 'center',justifyContent:'space-between', marginBottom: 12, marginLeft:16 },
  backButton: { padding: 8, backgroundColor: '#b6b6b6ff', borderRadius: 6, marginRight: 12},
  backText: {color: '#ffffffff', paddingHorizontal: 10, paddingVertical: 5},
  title: { fontSize: 24, fontWeight: '700' },
  body: { marginTop: 8 },
  card: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(200,16,46,0.2)',
    padding: 12,
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    width: '100%',
  },
  ContainerRow: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap:8,
    padding: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.6)', 
    flexDirection: 'column', 
    width: '100%' 
  },
  rowPai: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 6,
    margin:0,
    padding:0,
    width:'100%',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap:15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderRadius: 6,
  },
  key: { fontWeight: '500', color: '#333'},
    value: { color: '#111',
      flexWrap: 'wrap', 
      minWidth: 0, 
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
      whiteSpace: 'normal', 
      marginLeft: 4,
    },
    textSecondaryTitle: {
      fontSize:18,
      fontWeight: 'bold',
      width: '100%',
    },
    /* modal and dispatch styles */
    buttonWrap: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    dispatchButton: {
      backgroundColor: '#ff0000',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 220,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dispatchButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      width: '50%',
      height: '80%',
      maxHeight: '80%',
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    itemText: {
      fontSize: 16,
      fontWeight: '600',
    },
    itemSub: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
    },
    noteInput: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 6,
      padding: 8,
      backgroundColor: '#fafafa',
      minHeight: 40,
      textAlignVertical: 'top',
      width: '100%',
      height: '50%',
    },
    closeBtn: {
      backgroundColor: '#ddd',
      alignItems: 'center',
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 18,
    },
    closeBtnText: {
      fontWeight: '700',
    },
    sendBtn: {
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      backgroundColor: '#8ab4ff',
    },
    sendBtnText: {
      color: '#fff',
      fontWeight: '700',
    },
    continueBtn: {
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueBtnText: {
      color: '#fff',
      fontWeight: '700',
    },
});

export default DetalheOcorrencia;

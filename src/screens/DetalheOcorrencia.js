import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, ActivityIndicator, TextInput, Alert, Switch, Linking } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Span from '../components/Span';
import IncidentResponses from './IncidentResponses';

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
  const [troteSending, setTroteSending] = useState(false);
  // estados para finalização
  const [finalModalVisible, setFinalModalVisible] = useState(false);
  const [finalSending, setFinalSending] = useState(false);
  const [finalDescription, setFinalDescription] = useState('');
  const [selectedIncidentResponseId, setSelectedIncidentResponseId] = useState(null);
  const [finalResponses, setFinalResponses] = useState([]);
  const [finalMarkArrivalOccurrence, setFinalMarkArrivalOccurrence] = useState(false);
  const [finalMarkArrivalHospital, setFinalMarkArrivalHospital] = useState(false);
  const [finalMarkReturnVehicle, setFinalMarkReturnVehicle] = useState(false);
  const [finalMode, setFinalMode] = useState('finalize'); // 'finalize' | 'reopen'
  // WhatsApp modal / input
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [whatsappNumberDisplay, setWhatsappNumberDisplay] = useState('');
  const [whatsappNumberRaw, setWhatsappNumberRaw] = useState('');
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const formatBRPhone = (digits) => {
    // digits: string with only numbers, without country code
    // expected to format as (AA)99999-9999 for 11-digit numbers (area+9-digit mobile)
    const d = String(digits || '').replace(/\D/g, '');
    // if starts with country code 55, remove it for display
    let s = d;
    if (s.startsWith('55')) s = s.slice(2);
    // keep only up to 11 digits (2 area + 9 number) or fallback to available
    const max = 11;
    const trimmed = s.slice(0, max);
    if (trimmed.length <= 2) return `(${trimmed}`;
    if (trimmed.length <= 6) return `(${trimmed.slice(0,2)})${trimmed.slice(2)}`;
    if (trimmed.length <= 10) return `(${trimmed.slice(0,2)})${trimmed.slice(2,6)}-${trimmed.slice(6)}`;
    return `(${trimmed.slice(0,2)})${trimmed.slice(2,7)}-${trimmed.slice(7,11)}`;
  };

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

  // abre modal de finalização e busca incident responses para seleção
  const openFinalModal = async (mode = 'finalize') => {
    setFinalDescription('');
    setSelectedIncidentResponseId(null);
    setFinalMarkArrivalOccurrence(false);
    setFinalMarkArrivalHospital(false);
    setFinalMarkReturnVehicle(false);
    setFinalMode(mode);
    setFinalModalVisible(true);
    try {
      const email = encodeURIComponent(user?.email || '');
      const url = `https://cbm-app-6qeks.ondigitalocean.app/incident-response/${data.id}/responses${email ? `?email=${email}` : ''}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        setFinalResponses([]);
        setSelectedIncidentResponseId(null);
        return;
      }
      const d = await resp.json().catch(() => null);
      if (Array.isArray(d)) {
        setFinalResponses(d);
        // pré-seleciona a primeira resposta retornada (atendimento atual)
        setSelectedIncidentResponseId(d.length > 0 ? d[0].id : null);
      } else {
        setFinalResponses([]);
        setSelectedIncidentResponseId(null);
      }
    } catch (e) {
      console.warn('Erro ao buscar respostas para finalização', e);
      setFinalResponses([]);
      setSelectedIncidentResponseId(null);
    }
  };

  const handleSendFinalization = async () => {
    const isWeb = typeof window !== 'undefined' && typeof window.confirm === 'function';
    const isReopen = finalMode === 'reopen';

    if (!finalDescription || String(finalDescription).trim().length === 0) {
      if (isWeb) window.alert(isReopen ? 'Preencha o motivo da reabertura' : 'Preencha a descrição da finalização');
      else Alert.alert('Preencha', isReopen ? 'Preencha o motivo da reabertura' : 'Preencha a descrição da finalização');
      return;
    }
    if (!selectedIncidentResponseId) {
      if (isWeb) window.alert(isReopen ? 'Nenhum atendimento disponível para reabertura' : 'Nenhum atendimento disponível para finalização');
      else Alert.alert('Atenção', isReopen ? 'Nenhum atendimento disponível para reabertura' : 'Nenhum atendimento disponível para finalização');
      return;
    }

    const confirmTextWeb = isReopen ? 'Confirma a reabertura desta ocorrência?' : 'Confirma a finalização desta ocorrência?';
    const confirmTextNative = isReopen ? 'Confirma a reabertura desta ocorrência?' : 'Confirma a finalização desta ocorrência?';
    const proceed = isWeb ? window.confirm(confirmTextWeb) : await new Promise((res) => {
      Alert.alert('Confirmar', confirmTextNative, [
        { text: 'Cancelar', style: 'cancel', onPress: () => res(false) },
        { text: 'Sim', onPress: () => res(true) }
      ], { cancelable: true });
    });
    if (!proceed) return;

    setFinalSending(true);
    try {
      const isReopen = finalMode === 'reopen';
      const payload = {
        email: user?.email || '',
        incidentResponseId: Number(selectedIncidentResponseId),
        statusIncidentResponse: 'FINALIZACAO',
        description: String(finalDescription).trim(),
        finalize: isReopen ? false : true,
      };
      if (finalMarkArrivalOccurrence) payload.dateArrivalOccurrence = true;
      if (finalMarkArrivalHospital) payload.arrivalHospital = true;
      if (finalMarkReturnVehicle) payload.dateReturn = true;

      const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/finished-occurrence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => resp.statusText);
        if (isWeb) window.alert((isReopen ? 'Erro ao reabrir: ' : 'Erro ao finalizar: ') + (txt || resp.status));
        else Alert.alert('Erro', (isReopen ? 'Erro ao reabrir: ' : 'Erro ao finalizar: ') + (txt || resp.status));
        return;
      }

      if (isWeb) window.alert(isReopen ? 'Reabertura enviada com sucesso' : 'Finalização enviada com sucesso');
      else Alert.alert('Sucesso', isReopen ? 'Reabertura enviada com sucesso' : 'Finalização enviada com sucesso');
      setFinalModalVisible(false);
      try { if (typeof onBack === 'function') onBack(); } catch (e) { }
    } catch (e) {
      console.error(isReopen ? 'Falha ao enviar reabertura' : 'Falha ao enviar finalização', e);
      if (typeof window !== 'undefined' && window.alert) window.alert((isReopen ? 'Falha ao enviar reabertura: ' : 'Falha ao enviar finalização: ') + (e.message || e));
      else Alert.alert('Erro', (isReopen ? 'Falha ao enviar reabertura: ' : 'Falha ao enviar finalização: ') + (e.message || e));
    } finally { setFinalSending(false); }
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

  const handleTrote = () => {
    const isWeb = typeof window !== 'undefined' && typeof window.confirm === 'function';

    if (isWeb) {
      let textAlertTrote='';
      if(!data.isTrote){
        textAlertTrote='Deseja marcar esta ocorrência como trote?';
      } else {
        textAlertTrote='Deseja retirar o status de trote desta ocorrência?';
      }
      const confirmed = window.confirm(textAlertTrote);
      if (!confirmed) return;
      (async () => {
        setTroteSending(true);
        console.log('Marking trote for occurrence', user);
        const payload = { email: user.email || '', occurrenceId: Number(data.id) || data.id , value: !data.isTrote};
        try {
          const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/trote', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          });
          if (!resp.ok) {
            const text = await resp.text().catch(() => resp.statusText);
            window.alert('Erro ao marcar trote: ' + (text || resp.status));
            return;
          }

          // try to read server response to know resulting trote state
          const respData = await resp.json().catch(() => null);
          const detectMarked = (d) => {
            if (!d || typeof d !== 'object') return null;
            const keys = ['trote','isTrote','marked','isMarked','value'];
            for (const k of keys) if (Object.prototype.hasOwnProperty.call(d,k)) return Boolean(d[k]);
            return null;
          };
          const resulting = detectMarked(respData);
          // if backend didn't return explicit state, fallback to what we asked
          const finalState = resulting === null ? Boolean(payload.value) : resulting;

          if (finalState) {
            window.alert('Ocorrência marcada como trote com sucesso');
            try { if (typeof onBack === 'function') onBack(); } catch (e) { }
          } else {
            window.alert('Ocorrência desmarcada como trote');
            data.isTrote = !data.isTrote;
            // remain on same screen
          }
        } catch (e) {
          console.error('Falha ao marcar trote', e);
          window.alert('Falha ao marcar trote: ' + (e.message || e));
        } finally { setTroteSending(false); }
      })();
      return;
    }

    // React Native path
    Alert.alert(
      'Confirmar Trote',
      'Deseja marcar esta ocorrência como trote?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            setTroteSending(true);
            const payload = { email: user?.email || '', occurrenceId: Number(data.id) || data.id, value: !data.isTrote };
            try {
              const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/trote', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
              });
              if (!resp.ok) {
                const text = await resp.text().catch(() => resp.statusText);
                Alert.alert('Erro', 'Erro ao marcar trote: ' + (text || resp.status));
                return;
              }

              const respData = await resp.json().catch(() => null);
              const detectMarked = (d) => {
                if (!d || typeof d !== 'object') return null;
                const keys = ['trote','isTrote','marked','isMarked','value'];
                for (const k of keys) if (Object.prototype.hasOwnProperty.call(d,k)) return Boolean(d[k]);
                return null;
              };
              const resulting = detectMarked(respData);
              const finalState = resulting === null ? Boolean(payload.value) : resulting;

              if (finalState) {
                Alert.alert('Sucesso', 'Ocorrência marcada como trote com sucesso');
                try { if (typeof onBack === 'function') onBack(); } catch (e) { }
              } else {
                Alert.alert('Sucesso', 'Ocorrência desmarcada como trote');
                // stay on same screen
              }
            } catch (e) {
              console.error('Falha ao marcar trote', e);
              Alert.alert('Erro', 'Falha ao marcar trote: ' + (e.message || e));
            } finally { setTroteSending(false); }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const openInMaps = () => {
    // prefer coordinates when available
    const lat = data.geoLat || data.lat || data.latitude || null;
    const lon = data.geoLong || data.long || data.longitude || null;
    let url = '';
    const hasCoords = lat !== null && lat !== undefined && lon !== null && lon !== undefined && String(lat).trim() !== '' && String(lon).trim() !== '';
    if (hasCoords) {
      // normalize decimals (strings expected)
      const latS = String(lat).trim();
      const lonS = String(lon).trim();
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(latS + ',' + lonS)}`;
    } else {
      // fallback to textual address
      const address = `${data.addressLog ? `${data.addressLog}, ` : ''}${data.addressNum? `${data.addressNum}, ` : ''}${data.addressComp ? `${data.addressComp}, ` : ''}${data.addressBairro? `${data.addressBairro}, ` : ''}${data.addressCity? `${data.addressCity}, ` : ''}${data.addressState? `${data.addressState}, ` : ''}${data.addressCEP? `${data.addressCEP}` : ''}`.trim();
      if (!address || address.length === 0) {
        Alert.alert('Endereço não disponível', 'Não há coordenadas nem endereço para abrir no mapa.');
        return;
      }
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    const isWeb = typeof window !== 'undefined' && typeof window.open === 'function';
    try {
      if (isWeb) window.open(url, '_blank');
      else Linking.openURL(url);
    } catch (e) {
      console.error('Erro ao abrir maps', e);
      Alert.alert('Erro', 'Não foi possível abrir o mapa: ' + (e.message || e));
    }
  };

  const sendWhatsApp = async () => {
    // require phone number raw digits
    const raw = String(whatsappNumberRaw || '').replace(/\D/g, '');
    if (!raw) {
      Alert.alert('Número inválido', 'Informe o número de telefone para envio (com código do país ou DDD).');
      return;
    }

    // ensure country code 55 is prefixed
    let withCountry = raw;
    if (!withCountry.startsWith('55')) {
      withCountry = '55' + withCountry;
    }

    // basic length check (country + area + number) -> at least 10 digits without country, so >=12 with 55
    if (withCountry.length < 12) {
      Alert.alert('Número inválido', 'Número muito curto. Verifique o DDD e o número (ex: (65)99999-9999).');
      return;
    }

    // build map url same as openInMaps, normalizing decimal comma
    const latRaw = data.geoLat || data.lat || data.latitude || null;
    const lonRaw = data.geoLong || data.long || data.longitude || null;
    const lat = latRaw !== null && latRaw !== undefined ? String(latRaw).replace(',', '.').trim() : '';
    const lon = lonRaw !== null && lonRaw !== undefined ? String(lonRaw).replace(',', '.').trim() : '';
    const hasCoords = lat !== '' && lon !== '';
    const mapUrl = hasCoords ? `https://www.google.com/maps?q=${encodeURIComponent(lat + ',' + lon)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(((data.addressLog || '') + ' ' + (data.addressNum || '') + ' ' + (data.addressBairro || '') + ' ' + (data.addressCity || '') + ' ' + (data.addressState || '')).trim())}`;

    const addressText = `${data.addressLog ? `${data.addressLog}, ` : ''}${data.addressNum? `Número: ${data.addressNum}, ` : ''}${data.addressComp ? `Complemento: ${data.addressComp}, ` : ''}${data.addressBairro? `Bairro: ${data.addressBairro}, ` : ''}${data.addressCity? `${data.addressCity}, ` : ''}${data.addressState? `${data.addressState}, ` : ''}${data.addressCEP? `${data.addressCEP}` : ''}`;

    // incluir informações sobre vítimas (se houver)
    const victimsInfo = data.hasVictim ?
      `Tem vítimas: Sim\nQuantidade de vítimas: ${data.victimsQuantity || '-'}\nEstado da(s) vítima(s): ${data.conditionVictim || '-'}` :
      'Tem vítimas: Não';

    const message = `Natureza: ${data.natOco || '-'}\nDescrição: ${data.description || '-'}\nEndereço: ${addressText || '-'}\n${victimsInfo}\nLocalização: ${mapUrl}`;

    const url = `https://api.whatsapp.com/send?phone=${withCountry}&text=${encodeURIComponent(message)}`;

    setSendingWhatsapp(true);
    try {
      const isWeb = typeof window !== 'undefined' && typeof window.open === 'function';
      if (isWeb) window.open(url, '_blank');
      else await Linking.openURL(url);
      setWhatsappModalVisible(false);
      setWhatsappNumberDisplay('');
      setWhatsappNumberRaw('');
    } catch (e) {
      console.error('Erro ao abrir WhatsApp', e);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp: ' + (e.message || e));
    } finally {
      setSendingWhatsapp(false);
    }
  };

  const listData = [{ id: 'none', displayName: 'Sem deslocamento de veículo', noVehicle: true }, ...vehicles.map((v, idx) => ({ id: v.id || `v-${idx}`, ...v }))];
  // derive selected vehicle objects for display in confirmation
  const selectedVehicles = selectedVehicleIds
    .map((id) => vehicles.find((v) => String(v.id) === String(id) || String(v.plate) === String(id) || String(v.placa) === String(id) || String(v.name) === String(id)))
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.body}>
        {data.isTrote && (
          <View style={{backgroundColor:'#ffcccc', padding:24, borderRadius:6, margin:4}}>
            <Text style={{color:'#900', fontWeight:'700', fontSize:24, textAlign:'center'}}>Esta ocorrência foi marcada como trote.</Text>
          </View>
        )}
        {data.statusOccurrence === "FINALIZADO" && (
          <View style={{backgroundColor:'#fae8cdff', padding:24, borderRadius:6, margin:4}}>
            <Text style={{color:'#900', fontWeight:'700', fontSize:24, textAlign:'center'}}>Esta ocorrência foi marcada como FINALIZADA.</Text>
          </View>
        )}  
        <View style={styles.cardRed}>
          <View style={{flexDirection:'row', alignItems: 'center', justifyContent:'space-between'}}>
            <Text style={styles.title}>Detalhe da Ocorrência numero: {data.id}</Text>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => openFinalModal(data.statusOccurrence === 'FINALIZADO' ? 'reopen' : 'finalize')} style={styles.backButton} disabled={finalSending || troteSending}>
                {finalSending ? <ActivityIndicator color="#fff" /> : <Text style={[styles.backText]}>{data.statusOccurrence === 'FINALIZADO' ? 'Reabrir' : 'Finalizar'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTrote} style={styles.backButton} disabled={troteSending}>
                {troteSending ? <ActivityIndicator color="#fff" /> : <Text style={[styles.backText]}>Trote</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backButton}>
                <Text style={[styles.backText]}>Voltar</Text>
              </TouchableOpacity>

            </View>
          </View>
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
                  <View style={[styles.rowPai, {flexDirection:'colummn', justifyContent:'flex-start', alignItems:'flex-start'}]}>
                    <View style={[styles.row, {justifyContent:'flex-start', alignItems:'flex-start'}]}>
                      <Text style={styles.key}>Descrição: </Text>
                      <Text style={styles.value}>{ data.description} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>Endereço da ocorrência: </Text>
                      <View style={{flex:1}}>
                        <Text style={styles.value}>{`${data.addressLog ? `${data.addressLog}, ` : ''}${data.addressNum? `Número: ${data.addressNum}, ` : ''}${data.addressComp ? `Complemento: ${data.addressComp}, ` : ''}${data.addressBairro? `Bairro: ${data.addressBairro}, ` : ''}${data.addressCity? `Cidade: ${data.addressCity}, ` : ''}${data.addressState? `Estado: ${data.addressState}, ` : ''}${data.addressCEP? `CEP: ${data.addressCEP}.` : ''}`} </Text>
                      </View>
                    </View>
                    <View style={{flexDirection:'row', gap:8, marginTop:6}}>
                      <TouchableOpacity style={styles.mapBtn} onPress={openInMaps}>
                        <Text style={styles.mapBtnText}>Abrir no Google Maps 🗺️📍</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.whatsappBtn} onPress={() => setWhatsappModalVisible(true)}>
                        <Text style={styles.whatsappBtnText}>Enviar por WhatsApp ↗️</Text>
                      </TouchableOpacity>
                    </View>

                    {/* WhatsApp modal */}
                    <Modal
                      visible={whatsappModalVisible}
                      animationType="slide"
                      transparent={true}
                      onRequestClose={() => { setWhatsappModalVisible(false); setWhatsappNumberDisplay(''); setWhatsappNumberRaw(''); }}
                    >
                      <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent,{height:'auto'}]}>
                          <Text style={styles.modalTitle}>Enviar por WhatsApp</Text>
                          <Text style={{marginBottom:6}}>Informe o número (DDD + número).</Text>
                          <TextInput
                            style={styles.noteInput}
                            placeholder="(65)99999-9999"
                            value={whatsappNumberDisplay}
                            onChangeText={(t) => {
                              // accept only digits, update raw and formatted display
                              const digits = String(t || '').replace(/\D/g, '');
                              setWhatsappNumberRaw(digits);
                              setWhatsappNumberDisplay(formatBRPhone(digits));
                            }}
                            keyboardType="phone-pad"
                          />

                          <View style={{flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'center'}}>
                            <TouchableOpacity style={[styles.sendBtn, sendingWhatsapp ? styles.sendBtnDisabled : null]} onPress={sendWhatsApp} disabled={sendingWhatsapp}>
                              {sendingWhatsapp ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>ENVIAR</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.closeBtn} onPress={() => { setWhatsappModalVisible(false); setWhatsappNumberDisplay(''); setWhatsappNumberRaw(''); }}>
                              <Text style={styles.closeBtnText}>CANCELAR</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Modal>
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
        {}
        {/* render incident responses when occurrence is not in REGISTRADO state */}
        {data.statusOccurrence && data.statusOccurrence !== 'REGISTRADO' && (
          <View style={styles.cardYellow}>
            <IncidentResponses occurrenceId={data.id} occurrenceStatus={data.statusOccurrence} onBack={() => onBack && onBack()} />
          </View>
        )}

        {/* Finalização modal (renderizado fora do bloco REGISTRADO para estar sempre disponível) */}
        <Modal
          visible={finalModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => { setFinalModalVisible(false); setFinalResponses([]); setSelectedIncidentResponseId(null); }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{finalMode === 'reopen' ? 'Reabrir chamado' : 'Finalizar Atendimento'}</Text>

              <Text style={{fontWeight:'600', marginBottom:6}}>{finalMode === 'reopen' ? 'Atendimento atual para reabertura: ' : 'Atendimento atual: '}</Text>
              <View style={{maxHeight: 150}}>
                {finalResponses && finalResponses.length > 0 ? (
                  (() => {
                    const current = finalResponses[0];
                    return (
                      <View style={styles.item}>
                        <Text style={styles.itemText}>Atendimento #{current.id} — Iniciado: {current.dateInit ? new Date(current.dateInit).toLocaleString() : '-'}</Text>
                        <Text style={styles.itemSub}>{current.userResponse ? `Atendente: ${current.userResponse.userName}` : ''}</Text>
                        {current.incidentVehicles && current.incidentVehicles.length > 0 && (
                          <Text style={styles.itemSub}>Veículos despachados: {current.incidentVehicles.map(v => v.vehicle ? (v.vehicle.placa || v.vehicle.plate) : (v.placa || v.plate || '-')).join(', ')}</Text>
                        )}
                      </View>
                    );
                  })()
                ) : (
                  <Text>{finalMode === 'reopen' ? 'Nenhum atendimento disponível para reabertura.' : 'Nenhum atendimento disponível para finalização.'}</Text>
                )}
              </View>

              <View style={{marginTop:8}}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Horário de chegada ao local da ocorrência</Text>
                  <Switch value={finalMarkArrivalOccurrence} onValueChange={(v) => { if (v) { setFinalMarkArrivalHospital(false); setFinalMarkReturnVehicle(false); } setFinalMarkArrivalOccurrence(v); }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Horário de chegada ao hospital</Text>
                  <Switch value={finalMarkArrivalHospital} onValueChange={(v) => { if (v) { setFinalMarkArrivalOccurrence(false); setFinalMarkReturnVehicle(false); } setFinalMarkArrivalHospital(v); }} />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Horário de retorno do veículo ao quartel</Text>
                  <Switch value={finalMarkReturnVehicle} onValueChange={(v) => { if (v) { setFinalMarkArrivalOccurrence(false); setFinalMarkArrivalHospital(false); } setFinalMarkReturnVehicle(v); }} />
                </View>
              </View>

              <Text style={{fontWeight:'600', marginTop:8}}>Descrição (obrigatório)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder={finalMode === 'reopen' ? 'Motivo da reabertura' : 'Descrição da finalização'}
                value={finalDescription}
                onChangeText={setFinalDescription}
                multiline
              />

              <View style={{flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'center'}}>
                <TouchableOpacity
                  style={[styles.sendBtn, (!selectedIncidentResponseId || finalSending) ? styles.sendBtnDisabled : null]}
                  onPress={handleSendFinalization}
                  disabled={!selectedIncidentResponseId || finalSending}
                >
                  {finalSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>{finalMode === 'reopen' ? 'REABRIR' : 'CONFIRMAR'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeBtn} onPress={() => { setFinalModalVisible(false); setFinalResponses([]); setSelectedIncidentResponseId(null); }}>
                  <Text style={styles.closeBtnText}>CANCELAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,},
  header: { flexDirection: 'row', alignItems: 'center',justifyContent:'space-between', marginBottom: 12, marginLeft:16 },
  backButton: { padding: 4, backgroundColor: '#a09f9fff', borderRadius: 6, marginRight: 12},
  backText: {color: '#ffffffff', paddingHorizontal: 10, paddingVertical: 2, fontWeight: '600'},
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12, flex:9},
  body: { marginTop: 8 },
  cardRed: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 24,
  },
  cardYellow: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
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
    itemSelected: {
      backgroundColor: 'rgba(0,123,255,0.06)'
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
    mapBtn: {
      marginTop: 6,
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: '#007bff',
    },
    mapBtnText: {
      color: '#fff',
      fontWeight: '600',
    },
    whatsappBtn: {
      marginTop: 6,
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: '#25D366',
    },
    whatsappBtnText: {
      color: '#fff',
      fontWeight: '600',
    },
});

export default DetalheOcorrencia;

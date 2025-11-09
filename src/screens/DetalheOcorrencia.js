import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Span from '../components/Span';

const safe = (v) => (v === null || v === undefined ? '-' : v);

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
  console.log(data)
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
});

export default DetalheOcorrencia;

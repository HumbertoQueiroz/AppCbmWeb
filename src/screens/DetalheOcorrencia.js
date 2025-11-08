import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Span from '../components/Span';

const DetalheOcorrencia = ({ item, onBack }) => {
  const data = item || {};
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
              <View style={{width: '100%'}}>
                <View style={[styles.row, { backgroundColor: 'rgba(255,255,255,0.6)', flexDirection: 'column', width: '100%' }]} >
                  <Text style={{fontSize:18, fontWeight: 'bold', width: '100%'}}>Informante:</Text>
                  <View style={[styles.row, {margin:0, padding:0}]}>
                    <View style={styles.row}>
                      <Text style={styles.key}>Nome: </Text>
                      <Text style={styles.value}>{data.userName} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>CPF: </Text>
                      <Text style={styles.value}>{`${data.cpf.slice(0,3)}.${data.cpf.slice(3,6)}.${data.cpf.slice(6,9)}-${data.cpf.slice(9,11)}`} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>E-mail: </Text>
                      <Text style={styles.value}>{data.email} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>Telefone: </Text>
                      <Text style={styles.value}>{data.phone} </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.key}>Endereço: </Text>
                    <Text style={styles.value}>{`${data.addressLog ? `Logradouro: ${data.addressLog}, ` : ''}${data.addressNum? `Número: ${data.addressNum}, ` : ''}${data.addressComp ? `Complemento: ${data.addressComp}, ` : ''}${data.addressBairro? `Bairro: ${data.addressBairro}, ` : ''}${data.addressCidade? `Cidade: ${data.addressCidade}, ` : ''}${data.addressEstado? `Estado: ${data.addressEstado}, ` : ''}`} </Text>
                  </View>
                </View>
                <Span />
                <View style={[styles.row, { backgroundColor: 'rgba(255,255,255,0.6)', flexDirection: 'column', width: '100%' }]} >
                  <Text style={{fontSize:18, fontWeight: 'bold', width: '100%'}}>Ocorrência:</Text>
                  <View style={[styles.row, {margin:0, padding:0}]}>
                    <View style={styles.row}>
                      <Text style={styles.key}>Natureza: </Text>
                      <Text style={styles.value}>{data.natOco} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>CPF: </Text>
                      <Text style={styles.value}>{`${data.cpf.slice(0,3)}.${data.cpf.slice(3,6)}.${data.cpf.slice(6,9)}-${data.cpf.slice(9,11)}`} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>E-mail: </Text>
                      <Text style={styles.value}>{data.email} </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.key}>Telefone: </Text>
                      <Text style={styles.value}>{data.phone} </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.key}>Endereço: </Text>
                    <Text style={styles.value}>{`${data.addressLog ? `Logradouro: ${data.addressLog}, ` : ''}${data.addressNum? `Número: ${data.addressNum}, ` : ''}${data.addressComp ? `Complemento: ${data.addressComp}, ` : ''}${data.addressBairro? `Bairro: ${data.addressBairro}, ` : ''}${data.addressCidade? `Cidade: ${data.addressCidade}, ` : ''}${data.addressEstado? `Estado: ${data.addressEstado}, ` : ''}`} </Text>
                  </View>
                </View>

              </View>
              )
            }
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
  },
  key: { fontWeight: '500', color: '#333'},
  value: { color: '#111',flexWrap: 'wrap', minWidth: 0, overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal', },
});

export default DetalheOcorrencia;

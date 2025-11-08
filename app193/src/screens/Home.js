// src/screens/Home.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ocorrenciasData = [
    { informante: 'Humberto Queiroz', viatura: 'ABC-1234', endereco: 'Av. Brasil, 1121', descricao: 'Fogo na casa, esquina' },
];

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LISTA DE OCORRÊNCIAS ABERTAS</Text>
      <ScrollView>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>INFORMANTE</Text>
            <Text style={styles.headerText}>VIATURA</Text>
            <Text style={styles.headerText}>ENDEREÇO DA OCORRÊNCIA</Text>
            <Text style={styles.headerText}>DESCRIÇÃO DA OCORRÊNCIA</Text>
            <Text style={[styles.headerText, { width: 80 }]}>AÇÃO</Text>
          </View>
          {ocorrenciasData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{item.informante}</Text>
              <Text style={styles.cell}>{item.viatura}</Text>
              <Text style={styles.cell}>{item.endereco}</Text>
              <Text style={styles.cell}>{item.descricao}</Text>
              <Text style={[styles.cell, styles.actionButton]}>DESPACHAR</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  actionButton: {
    color: '#fff',
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
  },
});

export default Home;
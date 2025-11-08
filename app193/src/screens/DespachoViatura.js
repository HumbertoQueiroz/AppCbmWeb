// src/screens/DespachoViatura.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DespachoViatura = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DESPACHAR VIATURA</Text>
      {/* Aqui é onde entraria o formulário de despacho, que está em branco na sua imagem */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DespachoViatura;
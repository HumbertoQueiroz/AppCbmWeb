// src/components/Header.js
import React from 'react';
import { View, Text, StyleSheet, Image,TouchableOpacity } from 'react-native';

const Header = ({ title, onMenuPress }) => { // Receba uma nova propriedade
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Bem vindo Alisson!</Text>
      <Image
        source={require('../assets/CBMMT_00.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#ff0000ff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 18,
    marginRight: 'auto', // Empurra os outros elementos para a direita
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
   menuButton: {
    padding: 10,
    color: 'white',
  },
  menuText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Header;
// src/components/Sidebar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onSelectScreen }) => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.menuTitle}>Menu</Text>
      <View style={styles.menuItems}>
        <TouchableOpacity style={styles.menuItem} onPress={() => onSelectScreen('Home')}>
          <Text style={styles.menuText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onSelectScreen('Cadastro')}>
          <Text style={styles.menuText}>Cadastro Ocorrência</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onSelectScreen('CadastroUsuario')}>
          <Text style={styles.menuText}>Cadastro de Usuario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onSelectScreen('CadastroViatura')}>
          <Text style={styles.menuText}>Cadastro de Viaturas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onSelectScreen('Despacho')}>
          <Text style={styles.menuText}>Despacho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => onSelectScreen('RelatorioOcorrencia')}>
          <Text style={styles.menuText}>Relatório de Ocorrências</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Minha conta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <Text style={styles.menuText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: '#ff0000ff',
    paddingTop: 50,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuItems: {
    paddingLeft: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffffff',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Sidebar;
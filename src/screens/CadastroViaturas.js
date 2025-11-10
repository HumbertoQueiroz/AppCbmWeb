// src/screens/CadastroViatura.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useAuth } from '../contexts/AuthContext';

const CadastroViatura = ({ onSuccess, onCancel }) => {
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [cor, setCor] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");

  const handleCancelar = () => {
    setPlaca("");
    setModelo("");
    setAno("");
    setCor("");
    setTipo("");
    setStatus("");
    // if a cancel handler was provided by the parent, call it to navigate back
    try {
      if (typeof onCancel === 'function') onCancel();
    } catch (e) {
      // ignore
    }
  };

  const { user } = useAuth();

  const handleCadastrar = async () => {
    // Monta description com cor, ano e status conforme solicitado
    const descriptionParts = [];
    if (cor) descriptionParts.push(`Cor: ${cor}`);
    if (ano) descriptionParts.push(`Ano: ${ano}`);
    if (status) descriptionParts.push(`Status: ${status}`);
    const description = descriptionParts.join('; ');

    const payload = {
      email: user?.email || '',
      placa: placa,
      type: tipo,
      model: modelo,
    };
    if (description) payload.description = description;

    try {
      const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/create-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => resp.statusText);
        alert('Erro ao cadastrar viatura: ' + (text || resp.status));
        return;
      }
      const data = await resp.json().catch(() => null);
      alert('Viatura cadastrada com sucesso');
      console.log('create-vehicle response', data);
      // limpa campos
      handleCancelar();
      // navega de volta para a tela inicial se houver handler
      try {
        if (typeof onSuccess === 'function') onSuccess();
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.error('Falha ao chamar create-vehicle', e);
      alert('Falha ao cadastrar viatura: ' + (e.message || e));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastrar Viatura</Text>

      <TextInput
        style={styles.input}
        placeholder="Placa"
        value={placa}
        onChangeText={setPlaca}
      />

      <TextInput
        style={styles.input}
        placeholder="Modelo"
        value={modelo}
        onChangeText={setModelo}
      />

      <TextInput
        style={styles.input}
        placeholder="Ano"
        keyboardType="numeric"
        value={ano}
        onChangeText={setAno}
      />

      <TextInput
        style={styles.input}
        placeholder="Cor"
        value={cor}
        onChangeText={setCor}
      />

      <TextInput
        style={styles.input}
        placeholder="Tipo (Ex: Auto Bomba, Ambulância)"
        value={tipo}
        onChangeText={setTipo}
      />

      <TextInput
        style={styles.input}
        placeholder="Status (Disponível, Em manutenção...)"
        value={status}
        onChangeText={setStatus}
      />

      <View style={styles.botoes}>
        <TouchableOpacity style={[styles.botao, styles.cancelar]} onPress={handleCancelar}>
          <Text style={styles.textoBotao}>CANCELAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, styles.cadastrar]} onPress={handleCadastrar}>
          <Text style={styles.textoBotao}>CADASTRAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  botao: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelar: {
    backgroundColor: "#ff0000ff",
  },
  cadastrar: {
    backgroundColor: "#229a00",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CadastroViatura;

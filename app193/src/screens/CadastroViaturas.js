// src/screens/CadastroViatura.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const CadastroViatura = () => {
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
  };

  const handleCadastrar = () => {
    const novaViatura = { placa, modelo, ano, cor, tipo, status };
    console.log("🚒 Viatura cadastrada:", novaViatura);
    // aqui você pode chamar sua API/Backend para salvar no banco
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

// src/screens/CadastroUsuario.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity } from 'react-native';

const CadastroUsuario = () => {
  const [Email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  // Funções de validação
  const handleNomeChange = (text) => {
    // Apenas letras, espaços e acentos
    const lettersRegex = /^[a-zA-Z\u00C0-\u017F\s]*$/;
    if (lettersRegex.test(text) || text === '') {
      setNome(text);
    }
  };
    const handleCpfChange = (text) => {
    // Apenas números
    const numericRegex = /^\d*$/;
    if (numericRegex.test(text) || text === '') {
      setCpf(text);
    }
  };

    const handleTelefoneChange = (text) => {
    // Apenas números
    const numericRegex = /^\d*$/;
    if (numericRegex.test(text) || text === '') {
      setTelefone(text);
    }
  };

  const handleCadastrar = () => {
    // Lógica para enviar os dados para o backend
    console.log('Dados do cadastro:', { Email, senha, nome, cpf, telefone, endereco});
  };
  
  const handleCancelar = () => {
    // Lógica para cancelar e voltar
    console.log('Cancelado');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.contentContainer}>
        {/* Lado esquerdo: Formulário */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Cadastrar Usuários</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={Email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry={true}
            value={senha}
            onChangeText={setSenha}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={nome}
            onChangeText={handleNomeChange}
          />
          
          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cpf}
            onChangeText={handleCpfChange}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={handleTelefoneChange}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Endereço"
            value={endereco}
            onChangeText={setEndereco}
            multiline
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
              <Text style={styles.buttonText}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleCadastrar}>
              <Text style={styles.buttonText}>CADASTRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Lado direito: Imagem */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/CBMMT_00.png')}
            style={styles.logo}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row', // Organiza os elementos em linha (formulário e imagem lado a lado)
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginRight: 20, // Espaço entre o formulário e a imagem
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff0000ff',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#229a00',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CadastroUsuario;
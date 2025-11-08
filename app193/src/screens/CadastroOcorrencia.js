// src/screens/CadastroOcorrencia.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableOpacity } from 'react-native';

const CadastroOcorrencia = () => {
  const [solicitante, setSolicitante] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [tipoOcorrencia, setTipoOcorrencia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [historico, setHistorico] = useState('');
  
  // Funções de validação
  const handleNomeChange = (text) => {
    // Apenas letras, espaços e acentos
    const lettersRegex = /^[a-zA-Z\u00C0-\u017F\s]*$/;
    if (lettersRegex.test(text) || text === '') {
      setSolicitante(text);
    }
  };

  const handleTelefoneChange = (text) => {
    // Apenas números
    const numericRegex = /^\d*$/;
    if (numericRegex.test(text) || text === '') {
      setTelefone(text);
    }
  };

  const handleCpfChange = (text) => {
    // Apenas números
    const numericRegex = /^\d*$/;
    if (numericRegex.test(text) || text === '') {
      setCpf(text);
    }
  };

  const handleCadastrar = () => {
    // Lógica para enviar os dados para o backend
    console.log('Dados do cadastro:', { solicitante, telefone, cpf, tipoOcorrencia, endereco, historico });
  };
  
  const handleVoltar = () => {
    // Lógica para voltar para a tela anterior
    console.log('Voltando');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.contentContainer}>
        {/* Lado esquerdo: Formulário */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Cadastrar Ocorrência</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nome do solicitante"
            value={solicitante}
            onChangeText={handleNomeChange} // Usando a função de validação
            maxLength={50} 
          />
          
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={handleTelefoneChange} // Usando a função de validação
            maxLength={11} 
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder='CPF'
            value={cpf}
            onChangeText={handleCpfChange} // Usando a função de validação
            maxLength={11}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder='Tipo de Ocorrência'
            value={tipoOcorrencia}
            onChangeText={setTipoOcorrencia}
            maxLength={50} 
          />
          
          <TextInput
            style={styles.input}
            placeholder='Endereço'
            value={endereco}
            onChangeText={setEndereco}
            maxLength={70} 
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder='Descreva o histórico da ocorrência'
            value={historico}
            onChangeText={setHistorico}
            multiline
            maxLength={200}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.voltarButton} onPress={handleVoltar}>
              <Text style={styles.buttonText}>VOLTAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cadastrarButton} onPress={handleCadastrar}>
              <Text style={styles.buttonText}>CADASTRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Lado direito: Imagem */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/CBMMT_00.png')} // Confirme o caminho da sua imagem
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
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
  voltarButton: {
    backgroundColor: '#ff0000ff',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cadastrarButton: {
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

export default CadastroOcorrencia;
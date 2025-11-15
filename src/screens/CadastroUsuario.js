// src/screens/CadastroUsuario.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const CadastroUsuario = () => {
  const { user } = useAuth();

  const [Email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [userName, setUserName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // Endereço separado
  const [addressCEP, setAddressCEP] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressComp, setAddressComp] = useState('');
  const [addressIbge, setAddressIbge] = useState('');

  const [userWhoIsCreating] = useState(user ? (user.username || user.email) : '');
  const [matricula, setMatricula] = useState('');
  const [position, setPosition] = useState('');
  const [createdNewUser, setCreatedNewUser] = useState(false);

  // Funções de validação
  const handleNomeChange = (text) => {
    // Apenas letras, espaços e acentos
    const lettersRegex = /^[a-zA-Z\u00C0-\u017F\s]*$/;
    if (lettersRegex.test(text) || text === '') {
      setUserName(text);
    }
  };
    const handleCpfChange = (text) => {
      // Formata CPF enquanto digita: 000.000.000-00
      const digits = (text || '').replace(/\D/g, '').slice(0, 11);
      let formatted = digits;
      if (digits.length > 3 && digits.length <= 6) {
        formatted = digits.slice(0, 3) + '.' + digits.slice(3);
      } else if (digits.length > 6 && digits.length <= 9) {
        formatted = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
      } else if (digits.length > 9) {
        formatted = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
      }
      setCpf(formatted);
  };

    const handleTelefoneChange = (text) => {
      // Formata telefone enquanto digita: (66)99999-9999
      const digits = (text || '').replace(/\D/g, '').slice(0, 11); // DDD + 9
      let formatted = digits;
      if (digits.length > 2 && digits.length <= 6) {
        formatted = '(' + digits.slice(0, 2) + ')' + digits.slice(2);
      } else if (digits.length > 6) {
        // coloca hífen antes dos últimos 4 dígitos
        formatted = '(' + digits.slice(0, 2) + ')' + digits.slice(2, 7) + '-' + digits.slice(7);
      }
      setPhone(formatted);
  };

  const handleCepChange = (text) => {
    const numericRegex = /^\d*$/;
    if (numericRegex.test(text) || text === '') {
      setAddressCEP(text);
    }
  };

  const handleBuscarCep = async () => {
    const cep = addressCEP.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      Alert.alert('CEP inválido', 'Informe um CEP com 8 dígitos.');
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP informado.');
        return;
      }

      setAddressStreet(data.logradouro || '');
      setAddressDistrict(data.bairro || '');
      setAddressCity(data.localidade || '');
      setAddressState(data.uf || '');
      setAddressComp(data.complemento || '');
      setAddressIbge(data.ibge || '');
    } catch (e) {
      console.error('Erro ao buscar CEP', e);
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    }
  };

  // Validação de CPF (algoritmo oficial)
  const isValidCPF = (cpfValue) => {
    const cpfDigits = (cpfValue || '').replace(/\D/g, '');
    if (!cpfDigits || cpfDigits.length !== 11) return false;
    // rejeita CPFs com todos dígitos iguais
    if (/^(\d)\1{10}$/.test(cpfDigits)) return false;

    const calc = (t) => {
      let sum = 0;
      for (let i = 0; i < t; i++) {
        sum += parseInt(cpfDigits.charAt(i)) * ((t + 1) - i);
      }
      const res = (sum * 10) % 11;
      return res === 10 ? 0 : res;
    };

    const v1 = calc(9);
    const v2 = calc(10);
    return v1 === parseInt(cpfDigits.charAt(9)) && v2 === parseInt(cpfDigits.charAt(10));
  };

  const handleCadastrar = async () => {
    // Validação de senhas: devem existir e ser iguais
    const pwd = (senha || '').trim();
    const confirmPwd = (confirmSenha || '').trim();
    if (!pwd) {
      Alert.alert('Senha inválida', 'Informe a senha.');
      return;
    }
    if (pwd !== confirmPwd) {
      Alert.alert('Senhas diferentes', 'As senhas informadas não coincidem.');
      return;
    }

    // Validação CPF
    if (cpf && !isValidCPF(cpf)) {
      Alert.alert('CPF inválido', 'Verifique o CPF informado.');
      return;
    }

    // Monta o body conforme o schema solicitado
    const body = {
      userName: (userName || '').trim(),
      cpf: (cpf || '').trim(),
      addressStreet: (addressStreet || '').trim(),
      addressNumber: (addressNumber || '').trim(),
      addressDistrict: (addressDistrict || '').trim(),
      addressCity: (addressCity || '').trim(),
      addressState: (addressState || '').trim(),
      addressCEP: (addressCEP || '').trim(),
      addressComp: (addressComp || '').trim() || undefined,
      addressIbge: (addressIbge || '').trim() || undefined,
      phone: (phone || '').trim(),
      email: (Email || '').trim(),
  password: pwd,
      userWhoIsCreating: (userWhoIsCreating || '').trim(),
      matricula: (matricula || '').trim(),
      position: (position || '').trim(),
      createdNewUser: !!createdNewUser,
    };

    try {
      const res = await fetch('/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Erro no cadastro:', res.status, text);
        Alert.alert('Erro', 'Falha ao cadastrar usuário.');
        return;
      }

      const result = await res.json();
      console.log('Cadastro realizado:', result);
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso.');
      // opcional: limpar campos
    } catch (e) {
      console.error('Erro ao enviar cadastro', e);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
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
            placeholder="Confirmar senha"
            secureTextEntry={true}
            value={confirmSenha}
            onChangeText={setConfirmSenha}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={userName}
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
            value={phone}
            onChangeText={handleTelefoneChange}
          />
          <TextInput
            style={styles.input}
            placeholder="Matrícula"
            value={matricula}
            onChangeText={setMatricula}
          />

          <TextInput
            style={styles.input}
            placeholder="Cargo / Função"
            value={position}
            onChangeText={setPosition}
          />
          
          {/* CEP antes do endereço */}
          <TextInput
            style={styles.input}
            placeholder="CEP (apenas números)"
            value={addressCEP}
            onChangeText={handleCepChange}
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.submitButton, {marginTop: 0, marginBottom: 10}]} onPress={handleBuscarCep}>
            <Text style={styles.buttonText}>BUSCAR CEP</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Logradouro"
            value={addressStreet}
            onChangeText={setAddressStreet}
          />

          <TextInput
            style={styles.input}
            placeholder="Número"
            value={addressNumber}
            onChangeText={setAddressNumber}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Bairro"
            value={addressDistrict}
            onChangeText={setAddressDistrict}
          />

          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={addressCity}
            onChangeText={setAddressCity}
          />

          <TextInput
            style={styles.input}
            placeholder="Estado (UF)"
            value={addressState}
            onChangeText={setAddressState}
          />

          <TextInput
            style={styles.input}
            placeholder="Complemento (opcional)"
            value={addressComp}
            onChangeText={setAddressComp}
          />

          <TextInput
            style={styles.input}
            placeholder="IBGE (opcional)"
            value={addressIbge}
            onChangeText={setAddressIbge}
          />

          

          <View style={styles.switchContainer}>
            <Text style={{flex:1}}>Usuário tem permissão de criação de novos usuário?</Text>
            <Switch
              value={createdNewUser}
              onValueChange={setCreatedNewUser}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={createdNewUser ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
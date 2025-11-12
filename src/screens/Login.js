import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!username.trim() || !password) throw new Error('Preencha usuário e senha');

      const resp = await fetch('http://localhost:8080/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password }),
      });

      if (!resp.ok) {
        let text;
        try { text = await resp.text(); } catch (e) { text = resp.statusText; }
        throw new Error(text || 'Credenciais inválidas');
      }

      // Sucesso - pode retornar um JSON com dados do usuário/token
      try {
        const d = await resp.json();
        if (d && d.token) {
          try { localStorage.setItem('token', d.token); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        // resposta sem json
      }

      // Para manter compatibilidade com o AuthContext atual, chamamos login local
      await login(username.trim(), password);
    } catch (e) {
      setError(e.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isWide ? styles.containerRow : styles.containerColumn]}>
      <View style={[styles.leftPane, isWide ? styles.leftWide : styles.leftNarrow]}>
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Entrar</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            placeholder="Email"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isWide && (
        <View style={[styles.rightPane, styles.rightWide]}>
          {/* imagem na pasta public acessível em runtime via "/CBMMT_00.png" */}
          <View style={styles.imageBackground}>
            <Image source={{ uri: '/CBMMT_00.png' }} style={styles.logoImage} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100vh',
    width: '100%',
    backgroundColor: '#c8102e',
  },
  containerRow: {
    flexDirection: 'row',
    backgroundColor: '#c8102e',
  },
  containerColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c8102e',
  },
  leftPane: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftWide: {
    width: '50%',
    backgroundColor: '#c8102e', // vermelho (ajustável)
  },
  leftNarrow: {
    width: '100%',
    padding: 20,
    backgroundColor: '#c8102e',
  },
  rightPane: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightWide: {
    width: '50%',
    backgroundColor: '#fff',
  },
  rightNarrow: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  formWrapper: {
    width: 360,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  error: {
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#c8102e',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  logoImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
});

export default Login;

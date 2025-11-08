import React, { useState } from 'react';
import { View, StyleSheet, Text, } from 'react-native';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './screens/Home';
import CadastroOcorrencia from './screens/CadastroOcorrencia';
import DespachoViatura from './screens/DespachoViatura';  
import CadastroUsuario from './screens/CadastroUsuario';
import RelatorioOcorrencia from './screens/RelatorioOcorrencias';
import CadastroViatura from './screens/CadastroViaturas';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

   const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

const renderScreen = () => {
  switch (currentScreen) {
    case 'Home':
      return <Home />;
    case 'Cadastro':
      return <CadastroOcorrencia />;
    case 'Despacho':
      return <DespachoViatura />;
    case 'CadastroUsuario':
      return <CadastroUsuario />;
    default:
      return <Home />;
    case 'RelatorioOcorrencia':
      return <RelatorioOcorrencia />;
    case 'CadastroViatura':
      return <CadastroViatura />;
    }
  };

const getScreenTitle = () => {
  switch (currentScreen) {
    case 'Home':
      return 'Inicio-CBM';
    case 'Cadastro':
      return 'Cadastro Ocorrência-CBM';

    case 'Despacho':
      return 'Despacho-CBM';

    case 'CadastroUsuario':
      return 'Cadastro de Usuário-CBM';

    case 'CadastroViatura':
      return 'Cadastro de Viaturas-CBM';

    case 'RelatorioOcorrencia':
      return 'Relatório de Ocorrências-CBM';
    }
  };

  return (
    <View style={styles.container}>
      {/* EXIBE A SIDEBAR SÓ SE O ESTADO FOR TRUE */}
      {isSidebarVisible && <Sidebar onSelectScreen={setCurrentScreen} />}

      <View style={styles.mainContent}>
        {/* PASSA A FUNÇÃO PARA O BOTÃO DO HEADER */}
        <Header title={getScreenTitle()} onMenuPress={toggleSidebar} />
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Desenvolvido por TADS - IFMT</Text>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100vh',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#eee',
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
});

export default App;
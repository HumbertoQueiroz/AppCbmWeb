// src/screens/Home.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [victimsModalVisible, setVictimsModalVisible] = useState(false);
  const [victimsData, setVictimsData] = useState(null);
  const [victimsLoading, setVictimsLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      if (!user || !user.email) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('http://localhost:8080/list-occurrence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => resp.statusText);
          throw new Error(text || 'Erro ao buscar ocorrências');
        }

        const data = await resp.json();
        // espera que o backend retorne { listOccurrence: [...] } ou similar
        const list = data.listOccurrence || data.list || [];
        setOcorrencias(list || []);
        console.log(list);
      } catch (e) {
        setError(e.message || 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LISTA DE OCORRÊNCIAS ABERTAS</Text>
      {loading && <Text style={styles.info}>Carregando ocorrências...</Text>}
      {error && <Text style={[styles.info, { color: 'red' }]}>{error}</Text>}
      <ScrollView>
        <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.colNumero]}>Numero</Text>
              <Text style={[styles.headerText, styles.colDate]}>Data criação</Text>
              <Text style={[styles.headerText, styles.colInformante]}>Informante</Text>
              <Text style={[styles.headerText, styles.colNatureza]}>Natureza</Text>
              <Text style={[styles.headerText, styles.colVictim]}>Vítima</Text>
              <Text style={[styles.headerText, styles.colDescription]}>Descrição</Text>
              <Text style={[styles.headerText, styles.colStatus]}>Status</Text>
              <Text style={[styles.headerText, styles.colAction]}>Atender</Text>
            </View>
            {ocorrencias.length === 0 && !loading ? (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>Nenhuma ocorrência encontrada</Text>
              </View>
            ) : (
              ocorrencias.map((item) => {
                const u = item.user || {};
                const informante = `${u.userName || item.userName || ''}\n${u.cpf || item.cpf || ''}`.trim();
                const dateStr = item.createdAt
                  ? `${new Date(item.createdAt).toLocaleDateString()}\n${new Date(item.createdAt).toLocaleTimeString()}`
                  : '-';
                const desc = item.description
                  ? (item.description.length > 300 ? item.description.slice(0, 300) + '...' : item.description)
                  : '-';
                return (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.cell, styles.colNumero]}>{item.id}</Text>
                    <Text style={[styles.cell, styles.colDate]}>{dateStr}</Text>
                    <Text style={[styles.cell, styles.colInformante]}>{informante}</Text>
                    <Text style={[styles.cell, styles.colNatureza]}>{item.natOco || item.nature || '-'}</Text>
                    {item.hasVictim ? (
                      <TouchableOpacity
                        onPress={async () => {
                          const count = item.victimsQuantity || (item.victims ? item.victims.length : '-');
                          // se já tem dados de vítimas no item, mostra direto
                          if (item.victims && item.victims.length) {
                            setVictimsData(item.victims);
                            setVictimsModalVisible(true);
                            return;
                          }
                          // tenta buscar detalhes das vítimas via API
                          try {
                            setVictimsLoading(true);
                            const r = await fetch('http://localhost:8080/list-occurrence', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, email: user.email }),
                            });
                            if (!r.ok) {
                              const t = await r.text().catch(() => r.statusText);
                              setVictimsData([{ label: 'Erro', value: t }]);
                              setVictimsModalVisible(true);
                              return;
                            }
                            const d = await r.json();
                            const victims = d.victims || d.list || d.data || [];
                            setVictimsData(victims);
                            setVictimsModalVisible(true);
                          } catch (e) {
                            setVictimsData([{ label: 'Erro', value: e.message || String(e) }]);
                            setVictimsModalVisible(true);
                          } finally {
                            setVictimsLoading(false);
                          }
                        }}
                        style={[styles.cell, {minWidth:80}]}
                      >
                        <Text style={[styles.cell, styles.victimYes]}>{`Sim (${item.victimsQuantity || (item.victims ? item.victims.length : '-')})`}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.cell, styles.victimNo, {minWidth:80}]}>Não</Text>
                    )}
                    <Text style={[styles.cell, styles.colDescription]} title='teste'>{desc}</Text>
                    <Text style={[styles.cell, styles.colStatus]}>{item.statusOccurrence || '-'}</Text>
                    <View style={[styles.cell, styles.colAction]}>
                      <TouchableOpacity
                        style={styles.dispatchButton}
                        onPress={async () => {
                          // tenta despachar via API; se falhar, mostra alerta
                          try {
                            const r = await fetch('http://localhost:8080/list-occurrence', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, email: user.email }),
                            });
                            if (!r.ok) {
                              const t = await r.text().catch(() => r.statusText);
                              alert('Erro ao despachar: ' + t);
                              return;
                            }
                            alert('Despacho solicitado para ocorrência ' + item.id);
                          } catch (e) {
                            alert('Erro ao despachar: ' + (e.message || e));
                          }
                        }}
                      >
                        <Text style={styles.dispatchText}>Despachar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
        </View>
      </ScrollView>
      {victimsModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detalhes das vítimas</Text>
            {victimsLoading && <Text>Carregando...</Text>}
            {!victimsLoading && victimsData && victimsData.length === 0 && <Text>Nenhuma informação de vítima disponível.</Text>}
            {!victimsLoading && victimsData && victimsData.length > 0 && (
              <ScrollView style={{ maxHeight: 300 }}>
                {victimsData.map((v, idx) => (
                  <View key={idx} style={{ marginBottom: 10 }}>
                    {typeof v === 'string' ? (
                      <Text style={styles.modalText}>{v}</Text>
                    ) : v && v.label && v.value ? (
                      <Text style={styles.modalText}><Text style={{ fontWeight: '700' }}>{v.label}: </Text>{v.value}</Text>
                    ) : (
                      <Text style={styles.modalText}>{JSON.stringify(v)}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setVictimsModalVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  colNumero: {
    flex:1,
    textAlign: 'center',
  },
  colDate: {
    flex:2,
    textAlign: 'center',
  },
  colInformante: {
    flex:2,
    textAlign: 'center',
  },
  colNatureza: {
    flex:2,
    textAlign: 'center',
  },
  colVictim: {
    flex:2,
    textAlign: 'center',
  },
  colDescription: {
    flex:5,
    textAlign: 'left',
  },
  colStatus: {
    flex:2,
    textAlign: 'center',
  },
  colAction: {
    flex:2,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  cell: {
    textAlign: 'center',
    fontSize: 12,
  },
  actionButton: {
    color: '#fff',
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    width: 50,
    textAlign: 'center',
  },
  dispatchButton: {
    backgroundColor: '#c8102e',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  dispatchText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  victimYes: {
    backgroundColor: 'rgba(200,0,0,0.5)',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    textAlign: 'center',
    alignSelf: 'center',
  },
  victimNo: {
    color: '#000',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalCard: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
  },
  modalClose: {
    marginTop: 12,
    backgroundColor: '#c8102e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default Home;
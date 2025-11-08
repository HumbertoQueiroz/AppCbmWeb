// src/screens/Home.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const Home = ({ onOpen }) => {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchList = async () => {
      if (!user || !user.email) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('https://cbm-app-6qeks.ondigitalocean.app/list-occurrence', {
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
              <Text style={[styles.headerText, styles.colDescription, {textAlign: 'center'}]}>Descrição</Text>
              <Text style={[styles.headerText, styles.colStatus]}>Status</Text>
              <Text style={[styles.headerText, styles.colAction]}>Ações</Text>
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
                    <Text style={[styles.cell, item.hasVictim ? styles.victimYes : styles.victimNo,{minWidth:80, marginHorizontal:10}]}>{item.hasVictim ? `Sim (${item.victimsQuantity || (item.victims ? item.victims.length : '-')})` : 'Não'}</Text>
                    <Text style={[styles.cell, styles.colDescription]}>{desc}</Text>
                    <Text style={[styles.cell, styles.colStatus]}>{item.statusOccurrence || '-'}</Text>
                    <View style={[styles.cell, styles.colAction]}>
                      <TouchableOpacity
                        style={styles.dispatchButton}
                        onPress={async () => {
                          // ao clicar, pede detalhes ao backend e abre a tela de detalhe
                          try {
                            const r = await fetch('https://cbm-app-6qeks.ondigitalocean.app/list-occurrence', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item.id, email: user.email }),
                            });
                            if (!r.ok) {
                              const t = await r.text().catch(() => r.statusText);
                              alert('Erro ao obter detalhes: ' + t);
                              return;
                            }
                            const data = await r.json().catch(() => null);
                            // preferir um campo conhecido. O backend pode responder com
                            // { occurrence } ou { listOccurrence: [...] } ou a própria ocorrência.
                            let payload = item;
                            if (data) {
                              if (data.occurrence && typeof data.occurrence === 'object') {
                                payload = { ...item, ...data.occurrence };
                              } else if (Array.isArray(data.listOccurrence) && data.listOccurrence.length > 0) {
                                // tenta encontrar pela id
                                const found = data.listOccurrence.find((o) => String(o.id) === String(item.id));
                                payload = found || data.listOccurrence[0] || item;
                              } else if (typeof data === 'object' && data.id) {
                                payload = { ...item, ...data };
                              } else {
                                // fallback: keep original item
                                payload = item;
                              }
                            }
                            // se existir um objeto user dentro da ocorrência, promova suas
                            // propriedades para o nível superior para facilitar exibição
                            if (payload && typeof payload === 'object' && payload.user && typeof payload.user === 'object') {
                              const userObj = payload.user;
                              Object.entries(userObj).forEach(([k, v]) => {
                                // evita sobrescrever propriedades já existentes; se existir
                                // cria user_<prop>
                                if (!(k in payload)) payload[k] = v;
                                else payload[`user_${k}`] = v;
                              });
                              // removemos o objeto user original após promover as propriedades
                              try {
                                delete payload.user;
                              } catch (e) {
                                // ignore
                              }
                            }

                            if (typeof onOpen === 'function') {
                              onOpen(payload);
                            }
                          } catch (e) {
                            alert('Erro ao obter detalhes: ' + (e.message || e));
                          }
                        }}
                      >
                        <Text style={styles.dispatchText}>Atender</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
        </View>
      </ScrollView>
      
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
    flex: 1,
    textAlign: 'center',
  },
  colDate: {
    flex: 2,
    textAlign: 'center',
  },
  colInformante: {
    flex: 3,
    textAlign: 'center',
  },
  colNatureza: {
    flex: 2,
    textAlign: 'center',
  },
  colVictim: {
    flex: 1,
    textAlign: 'center',
  },
  colDescription: {
    flex: 5,
    textAlign: 'left',
    // allow wrapping and breaking of very long words (helps on web)
    flexWrap: 'wrap',
    minWidth: 0,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  },
  colStatus: {
    flex: 2,
    textAlign: 'center',
  },
  colAction: {
    flex: 2,
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
    flexShrink: 1,
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
    width: 50,
    textAlign: 'center',
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
});

export default Home;
// src/screens/RelatorioOcorrencia.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';

const RelatorioOcorrencia = () => {
    // States do formulário (mantidos para funcionalidade)
    const [aviso, setAviso] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [pessoaAtendida, setPessoaAtendida] = useState('');
    const [docIdentificacao, setDocIdentificacao] = useState('');
    const [email, setEmail] = useState('');
    const [endereco, setEndereco] = useState('');
    const [proximidade, setProximidade] = useState('');
    const [grupo, setGrupo] = useState('');
    const [natureza, setNatureza] = useState('');
    const [acidenteTrabalho, setAcidenteTrabalho] = useState('');
    const [complemento, setComplemento] = useState('');
    const [locais, setLocais] = useState('');
    const [viaturas, setViaturas] = useState('');
    const [efetivo, setEfetivo] = useState('');
    const [nivelLesao, setNivelLesao] = useState('');
    const [orgaoApoio, setOrgaoApoio] = useState('');
    const [materiais, setMateriais] = useState('');
    const [historico, setHistorico] = useState('');
    const [nome, setNome] = useState('');
    const [posto, setPosto] = useState('');
    const [graduacao, setGraduacao] = useState('');
    const [funcao, setFuncao] = useState('');
    const [matricula, setMatricula] = useState('');

    const [dificuldades, setDificuldades] = useState({
        acessoDificil: false,
        populacaoHostil: false,
        faltaEPI: false,
        ambienteInsalubre: false,
        semRecursosHidricos: false,
        semSuporte: false,
        hostilizacaoImprensa: false,
        riscoEletrico: false,
        resgateTransito: false,
        semContagioComunicacao: false,
        areaRuralRemota: false,
        outros: false,
        assinaturaDigital: false,
    });

    const toggleCheckbox = (name) => {
        setDificuldades(prevDificuldades => ({
            ...prevDificuldades,
            [name]: !prevDificuldades[name],
        }));
    };

    const handleCadastrar = () => {
        console.log('Dados do relatório cadastrados!');
    };

    const handleCancelar = () => {
        console.log('Cancelado');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formWrapper}>
                <Text style={styles.title}>Relatório de Ocorrência</Text>

                {/* Seção Cabeçalho */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Cabeçalho</Text>
                    <View style={styles.inputRow}>
                        {/* 3 Colunas: Aviso, Data, Hora */}
                        <TextInput style={styles.inputColumn} placeholder="Aviso nº" value={aviso} onChangeText={setAviso} />
                        <TextInput style={styles.inputColumn} placeholder="Data" value={data} onChangeText={setData} dataDetectorTypes={'date'} />
                        <TextInput style={styles.inputColumn} placeholder="Hora" value={hora} onChangeText={setHora} />
                    </View>
                    {/* 1 Coluna: Pessoa atendida */}
                    <TextInput style={styles.fullWidthInput} placeholder="Pessoa atendida" value={pessoaAtendida} onChangeText={setPessoaAtendida} />
                    <View style={styles.inputRow}>
                        {/* 2 Colunas: Documento, Email */}
                        <TextInput style={styles.inputColumnHalf} placeholder="Documento de identificação" value={docIdentificacao} onChangeText={setDocIdentificacao} />
                        <TextInput style={styles.inputColumnHalf} placeholder="Email" value={email} onChangeText={setEmail} />
                    </View>
                    <View style={styles.inputRow}>
                        {/* 2 Colunas: Endereço, Proximidade */}
                        <TextInput style={styles.inputColumnHalf} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
                        <TextInput style={styles.inputColumnHalf} placeholder="Proximidade" value={proximidade} onChangeText={setProximidade} />
                    </View>
                </View>

                {/* Seção Caracterização da ocorrência */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Caracterização da ocorrência</Text>
                    <View style={styles.inputRow}>
                        {/* 3 Colunas: Grupo, Natureza, Acidente de Trabalho */}
                        <TextInput style={styles.inputColumn} placeholder="Grupo" value={grupo} onChangeText={setGrupo} />
                        <TextInput style={styles.inputColumn} placeholder="Natureza da ocorrência" value={natureza} onChangeText={setNatureza} />
                        <TextInput style={styles.inputColumn} placeholder="Acidente de Trabalho" value={acidenteTrabalho} onChangeText={setAcidenteTrabalho} />
                    </View>
                    <View style={styles.inputRow}>
                        {/* 3 Colunas: Complemento, Locais, +Adicionar Vítimas */}
                        <TextInput style={styles.inputColumn} placeholder="Complemento" value={complemento} onChangeText={setComplemento} />
                        <TextInput style={styles.inputColumn} placeholder="Locais" value={locais} onChangeText={setLocais} />
                        <TouchableOpacity style={styles.addButton}>
                            <Text style={styles.addButtonText}>+Adicionar Vítimas</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Seção Recursos Empregados */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Recursos Empregados</Text>
                    <View style={styles.inputRow}>
                        {/* 3 Colunas: Viaturas, Efetivo, Nível de lesão */}
                        <TextInput style={styles.inputColumn} placeholder="Viaturas" value={viaturas} onChangeText={setViaturas} />
                        <TextInput style={styles.inputColumn} placeholder="Efetivo" value={efetivo} onChangeText={setEfetivo} />
                        <TextInput style={styles.inputColumn} placeholder="Nível de lesão" value={nivelLesao} onChangeText={setNivelLesao} />
                    </View>
                    <View style={styles.inputRow}>
                        {/* 2 Colunas: Órgão de apoio, Materiais */}
                        <TextInput style={styles.inputColumnHalf} placeholder="Órgão de apoio" value={orgaoApoio} onChangeText={setOrgaoApoio} />
                        <TextInput style={styles.inputColumnHalf} placeholder="Materiais" value={materiais} onChangeText={setMateriais} />
                    </View>
                </View>

                {/* Seção Dificuldades Encontradas */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Dificuldades Encontradas</Text>
                    {/* Linhas de 4 Checkboxes */}
                    <View style={styles.checkboxRow}>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('acessoDificil')}>
                            <View style={styles.checkboxBox}>{dificuldades.acessoDificil && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Acesso difícil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('populacaoHostil')}>
                            <View style={styles.checkboxBox}>{dificuldades.populacaoHostil && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>População Hostil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('faltaEPI')}>
                            <View style={styles.checkboxBox}>{dificuldades.faltaEPI && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Falta de EPI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('ambienteInsalubre')}>
                            <View style={styles.checkboxBox}>{dificuldades.ambienteInsalubre && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Ambiente insalubre</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.checkboxRow}>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('semRecursosHidricos')}>
                            <View style={styles.checkboxBox}>{dificuldades.semRecursosHidricos && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Sem Recursos Hídricos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('semSuporte')}>
                            <View style={styles.checkboxBox}>{dificuldades.semSuporte && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Sem Suporte</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('hostilizacaoImprensa')}>
                            <View style={styles.checkboxBox}>{dificuldades.hostilizacaoImprensa && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Hostilização na Imprensa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('riscoEletrico')}>
                            <View style={styles.checkboxBox}>{dificuldades.riscoEletrico && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Risco elétrico</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.checkboxRow}>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('resgateTransito')}>
                            <View style={styles.checkboxBox}>{dificuldades.resgateTransito && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Resgate em Trânsito</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('semContagioComunicacao')}>
                            <View style={styles.checkboxBox}>{dificuldades.semContagioComunicacao && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Sem contágio comunicação</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('areaRuralRemota')}>
                            <View style={styles.checkboxBox}>{dificuldades.areaRuralRemota && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Área Rural Remota</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCheckbox('outros')}>
                            <View style={styles.checkboxBox}>{dificuldades.outros && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Outros</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Seção Histórico */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Histórico</Text>
                    <Text style={styles.historicalText}>Relate de forma clara e objetiva: o quê, como, onde e quem esteve envolvido. Evite repetir informações já registradas em outros campos.</Text>
                    <TextInput
                        style={[styles.fullWidthInput, styles.textArea]}
                        multiline
                        placeholder="Relato..."
                        value={historico}
                        onChangeText={setHistorico}
                    />
                </View>

                {/* Seção de Assinatura */}
                <View style={styles.section}>
                    <View style={styles.inputRow}>
                        {/* 3 Colunas: Nome, Posto, Graduação */}
                        <TextInput style={styles.inputColumn} placeholder="Nome" value={nome} onChangeText={setNome} />
                        <TextInput style={styles.inputColumn} placeholder="Posto" value={posto} onChangeText={setPosto} />
                        <TextInput style={styles.inputColumn} placeholder="Graduação" value={graduacao} onChangeText={setGraduacao} />
                    </View>
                    <View style={styles.inputRow}>
                        {/* 3 Colunas: Função, Matrícula, Assinatura Digital (Checkbox) */}
                        <TextInput style={styles.inputColumn} placeholder="Função" value={funcao} onChangeText={setFuncao} />
                        <TextInput style={styles.inputColumn} placeholder="Matricula" value={matricula} onChangeText={setMatricula} />
                        <TouchableOpacity style={styles.checkboxSignature} onPress={() => toggleCheckbox('assinaturaDigital')}>
                            <View style={styles.checkboxBox}>{dificuldades.assinaturaDigital && <Text style={styles.checkboxTextChecked}>X</Text>}</View>
                            <Text style={styles.checkboxText}>Assinatura Digital</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Botões */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
                        <Text style={styles.buttonText}>CANCELAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleCadastrar}>
                        <Text style={styles.buttonText}>CADASTRAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

// --- STYLESHEET CORRIGIDO: Referências de Estilo Diretas ---
const inputBase = { 
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    marginHorizontal: 5, // Espaçamento entre os inputs
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
    },
    formWrapper: {
        width: '100%',
        maxWidth: 900,
        padding: 20,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: '#ff0000ff',
        color: '#fff',
        padding: 10,
        textAlign: 'center',
        borderRadius: 5,
        marginBottom: 10,
    },
    
    // ESTILOS DE GRID/FLEXBOX
    inputRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -5, // Compensa as margens laterais dos inputs
    },
    
    // CORREÇÃO: Usando o objeto inputBase definido fora do StyleSheet.create
    inputColumn: { // Para 3 colunas (flex: 1 = 1/3)
        flex: 1, 
        ...inputBase,
    },
    inputColumnHalf: { // Para 2 colunas (flex: 1 = 1/2)
        flex: 1, 
        ...inputBase,
    },
    
    fullWidthInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    historicalText: {
        marginBottom: 10,
    },
    
    // BOTÃO ADICIONAR VÍTIMAS
    addButton: {
        flex: 1, 
        ...inputBase,
        backgroundColor: '#ff0000ff',
        justifyContent: 'center',
        alignItems: 'center',
        height: 42, // Altura padronizada para alinhamento com TextInput
        borderColor: '#ff0000ff', // Ajusta a borda para o botão
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    
    // CHECKBOXES
    checkboxRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -5, 
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexBasis: '25%', // Largura de 1/4
        marginBottom: 10,
        paddingHorizontal: 5, 
    },
    // CHECKBOX ASSINATURA
    checkboxSignature: {
        flex: 1, 
        ...inputBase,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10, 
    },
    checkboxBox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#000',
        marginRight: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxTextChecked: {
        fontWeight: 'bold',
        color: '#ff0000ff',
    },
    checkboxText: {
        fontSize: 14,
    },
    
    // BOTÕES FINAIS
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
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

export default RelatorioOcorrencia;
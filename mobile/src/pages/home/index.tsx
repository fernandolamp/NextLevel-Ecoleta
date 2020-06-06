import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Text, StyleSheet, Image } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'

const Home = () => {
    const navigation = useNavigation();

    interface IBGEUfResponse {
        sigla: string
    }

    interface IBGECityResponse {
        nome: string
    }

    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('');
    const [selectedCity, setSelectedCity] = useState('0');

    useEffect(() => {
        axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        })
    }, [])

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then((response) => {
            const cities = response.data.map(city => city.nome);
            setCities(cities);

        })
    }, [selectedUf]);


    function handeNavigateToPoints() {
        navigation.navigate('Points',{city:selectedCity, uf:selectedUf});
    }
    function handleSelectedUf(value: string) {
        setSelectedUf(value);
    }
    function handleSelectedCity(value: string) {
        setSelectedCity(value);
    }

    return (
        <ImageBackground
            source={require('../../assets/home-background.png')}
            style={styles.container}
            imageStyle={{ width: 276, height: 368 }}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')}></Image>
                <Text style={styles.title}>Seu Market Place para coleta de residuos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
            </View>
            <View>
                <RNPickerSelect
                    placeholder={
                        {
                            label: 'Selecione o seu estado',
                            value: '',
                            color: '#322153'
                            
                        }
                    }
                    onValueChange={(value) => handleSelectedUf(value)}
                    items={ufs.map((uf) => (
                        {
                            label: uf, value: uf
                        }
                    ))}
                />
                
                {selectedUf != '' && (
                    <RNPickerSelect
                        placeholder={
                            {
                                label: 'Selecione o sua cidade',
                                value: ''
                            }
                        }
                        onValueChange={(value) => handleSelectedCity(value)}
                        items={cities.map((cities) => (
                            {
                                label: cities, value: cities
                            }
                        ))}
                    />
                )
                }

            </View>
            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handeNavigateToPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name="arrow-right" color="#FFF" size={24}></Icon>
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Entrar
                    </Text>
                </RectButton>
            </View>
        </ImageBackground>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});

export default Home;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'
import * as Location from 'expo-location';
import api from '../../services/api';


const Points = () => {

    interface Items {
        id: number;
        title: string;
        image_url: string;
    }

    interface Points {
        id: number,
        name: string,
        image: string,
        image_url: string,
        latitude: number,
        longitude: number,
    }

    interface Params {
        uf: string;
        city: string;
    }

    const route = useRoute();
    const routeParams = route.params as Params;

    const [items, setitems] = useState<Items[]>([]);
    const [points, setPoints] = useState<Points[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();

            if (status != 'granted') {
                Alert.alert('Localização', 'Precisamos de sua permissão para obter a localização');
                return;
            }
            const location = await Location.getCurrentPositionAsync();
            const { latitude, longitude } = location.coords;
            setInitialPosition([latitude, longitude]);
        }
        console.log(initialPosition);
        loadPosition();
    }, [])

    useEffect(() => {
        api.get('items').then(response => {
            setitems(response.data);
        })
    }, []);

    useEffect(() => {
        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                items: selectedItems.join(',')
            }
        }).then(response => {
            console.log(route.params);
            console.log(`Point city:${routeParams.city}`);
            console.log(`Point uf:${routeParams.uf}`);
            console.log(`Selected Items:${selectedItems.join(',')}`);
            setPoints(response.data);
        })
    }, [selectedItems])

    const navigation = useNavigation();

    function handleNavigatorBack() {
        navigation.goBack();

    }

    function handleNavigatorToDetail(id: number) {
        navigation.navigate('Detail', { point_id: id });
    }

    function handleSelectItem(id: number) {
        const alredySelected = selectedItems.findIndex(item => item === id);

        if (alredySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigatorBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>
                <Text style={styles.title}>Bem vindo</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta</Text>
                <View style={styles.mapContainer}>
                    {initialPosition[0] !== 0 && (<MapView style={styles.map}
                        loadingEnabled={initialPosition[0] === 0}
                        initialRegion={{
                            latitude: initialPosition[0],
                            longitude: initialPosition[1],
                            latitudeDelta: 0.014,
                            longitudeDelta: 0.014
                        }}
                    >
                        {points.map(point => {
                            console.log(`adicionando marker: ${point.latitude}, ${point.longitude} `);
                            return (
                                <Marker
                                    key={String(point.id)}
                                    onPress={() => handleNavigatorToDetail(point.id)}
                                    style={styles.mapMarker}
                                    coordinate={
                                        {
                                            latitude: point.latitude,
                                            longitude: point.longitude,
                                        }
                                    }>
                                    <View style={styles.mapMarkerContainer}>
                                        <Image
                                            style={styles.mapMarkerImage}
                                            source={{
                                                uri: point.image_url
                                            }}>

                                        </Image>
                                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            )
                        })}
                    </MapView>
                    )}
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {items.map(item => (
                        <TouchableOpacity
                            key={String(item.id)}
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            onPress={() => handleSelectItem(item.id)}
                            activeOpacity={0.5}
                        >
                            <SvgUri width={42} height={42} uri={item.image_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>

                    ))}
                </ScrollView>
            </View>

        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api'
import axios from 'axios'
import Dropzone from '../../components/dropzone'

import './styles.css'
import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUfResponse{
    sigla:string
}

interface IBGECityResponse{
    nome:string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectdPosition, setSelectPosition] = useState<[number, number]>([0,0]);
    const [initialPosition, setinitialPosition] = useState<[number, number]>([0,0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp:''
    });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();
    const history = useHistory()    
    

    
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    useEffect(()=>{
        axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response)=>{
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        })

    },[])
        
    useEffect(()=>{
        if(selectedUf === '0'){
            return;
        }
        
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then((response)=>{
            const cities = response.data.map(city => city.nome);
            setCities(cities);
            
        })
    },[selectedUf]);

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
            setinitialPosition([latitude, longitude]);
            setSelectPosition([latitude, longitude]);
        } )
    },[])

    function handleSelectedUf(e:ChangeEvent<HTMLSelectElement>){
        console.log(e.target.value)
        setSelectedUf(e.target.value)        
    }
    function handleSelectCity(e:ChangeEvent<HTMLSelectElement>){
        setSelectedCity(e.target.value)
    }
    function handleMapClick(e:LeafletMouseEvent){
        setSelectPosition([e.latlng.lat, e.latlng.lng])
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>){
        const {name, value} = e.target;
        setFormData({ ...formData, [name]:value })
    }

    function handleSelectItem(id:number){
        const alredySelected = selectedItems.findIndex(item => item === id);

        if (alredySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else{
            setSelectedItems([ ...selectedItems, id]);
        }   
    }

    async function handleSubmit(e:FormEvent){
        e.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude,longitude] = selectdPosition;
        const items = selectedItems;
        
        const data = new FormData();
        
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp',whatsapp);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));
        data.append('uf',uf);
        if(selectedFile){
          data.append('image',selectedFile);
        }
        
        console.log(data);
        await api.post('points',data);

        alert('Ponto de coleta criado!')

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"></img>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit ={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta </h1>
                <Dropzone onFileUploaded = {setSelectedFile} />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectdPosition}></Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                                <option value="0">Selectione uma uf</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity} >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                        </div>

                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais ítens a baixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id)? 'selected' : ''}
                                 >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button>Cadastrar ponto de coleta</button>

            </form>
        </div>

    );
};

export default CreatePoint;


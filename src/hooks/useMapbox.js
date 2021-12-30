import {useCallback, useEffect, useRef, useState} from "react";
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;

import {v4} from 'uuid'
import {Subject} from "rxjs";

mapboxgl.accessToken =process.env.REACT_APP_MAPBOX_API_KEY;
export const useMapbox = (puntoInicial) =>{

    const mapDiv = useRef();

    const setRef = useCallback((node)=>{
        mapDiv.current = node;
    }, []);

    const mapa = useRef();
    const [ coords, setCoords] = useState(puntoInicial);
    const marcadores = useRef({});

    const movimientoMarcador = useRef(new Subject());
    const nuevoMarcador = useRef(new Subject());

    const agregarMarcador = useCallback((event, id)=>{
        const markerCoords = event.lngLat || event;
        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();
        marker
            .setLngLat([markerCoords.lng, markerCoords.lat])
            .addTo(mapa.current)
            .setDraggable(true)
        marcadores.current[marker.id] = marker;

        if(!id){
            nuevoMarcador.current.next({
                id: marker.id,
                lng: markerCoords.lng,
                lat: markerCoords.lat
            })
        }
        marker.on('drag', (ev)=>{
            const {id} = ev.target;
            const {lng, lat}  = ev.target.getLngLat();
            movimientoMarcador.current.next({id, lng, lat});
        })
    },[])

    //actualizzar la ubicaion del marcador 

    const actualizarPosicion = useCallback((marcador)=>{
        const {id, lng, lat} = marcador;
        marcadores.current[id].setLngLat([lng,lat])
    },[])

    useEffect(()=>{
        var map = new mapboxgl.Map({
            container:mapDiv.current,
            style:'mapbox://styles/mapbox/streets-v11',
            center: [puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zoom
        });
        mapa.current = map;
    },[puntoInicial]);

    useEffect(()=>{
        mapa.current?.on('move', ()=>{
            const newCoords = mapa.current.getCenter();
            setCoords({
                lng: newCoords.lng.toFixed(4),
                lat: newCoords.lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2),
            });
        })
    }, [])

    useEffect(()=>{
        mapa.current?.on('click',agregarMarcador);
    },[agregarMarcador])

    return {
        coords,
        setRef,
        marcadores,
        actualizarPosicion,
        agregarMarcador,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current
    }
}

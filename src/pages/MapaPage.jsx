import {useContext, useEffect} from "react";
import {SocketContext} from "../context/SocketContext";
import {useMapbox} from "../hooks/useMapbox";

const puntoInicial = {
    lng:-79,
    lat: -8.1,
    zoom: 13.5
}

export const MapaPage = () =>{

    const {coords, setRef, nuevoMarcador$, movimientoMarcador$,actualizarPosicion, agregarMarcador} = useMapbox(puntoInicial);
    const {socket} = useContext(SocketContext);


    useEffect(()=>{
        socket.on('marcadores-activos', (marcadores)=>{
            for(const key of Object.keys(marcadores)){
                agregarMarcador(marcadores[key], key)
            }
        })
    },[socket, agregarMarcador])

    //nuevo marcaador
    useEffect(()=>{
        nuevoMarcador$.subscribe(marcador =>{
            socket.emit('marcador-nuevo', marcador)
        })
    },[nuevoMarcador$, socket])
    
    //movimiento de marcador
    useEffect(()=>{
        socket.on('marcador-actualizado', (marcador)=>{
            actualizarPosicion(marcador)
        });
    },[socket, actualizarPosicion]);

    useEffect(()=>{
        movimientoMarcador$.subscribe(marcador=>{
            socket.emit('marcador-actualizado', marcador);
        })
    },[socket,movimientoMarcador$])
    //mover marcador mediante socket

    //escuchar nuevos  marcadores
    useEffect(()=>{
        socket.on('marcador-nuevo', (marcador)=>{
            agregarMarcador(marcador,marcador.id)
        })
    },[socket, agregarMarcador])

    return(
        <>
            <div className="info">
                lng: {coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}
            </div>
            <div ref={setRef} className="mapContainer">
            </div>
        </>
    )
}

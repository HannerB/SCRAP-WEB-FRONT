import React, { useState } from 'react';
import { fetchScrapData } from '../services/scrapService';

export default function ScrapComponent() {
    const [datos, setDatos] = useState(null);
    const [buscando, setBuscando] = useState(false);
    const [horaInicio, setHoraInicio] = useState(null);
    const [horaFin, setHoraFin] = useState(null);
    const [modoComparacion, setModoComparacion] = useState(false);

    const handleFetchData = async (fetchFirstPage, fetchSecondPage) => {
        setDatos(null);
        setBuscando(true);
        setHoraInicio(new Date());
        setModoComparacion(fetchFirstPage && fetchSecondPage);

        try {
            const data = await fetchScrapData(fetchFirstPage, fetchSecondPage);
            setDatos(data);
        } catch (error) {
            console.error('Ocurrió un error al obtener los datos:', error);
        } finally {
            setBuscando(false);
            setHoraFin(new Date());
        }
    };

    const prepareBalancedData = (data) => {
        if (!data || data.length === 0) return [];
        
        const minLength = Math.min(
            data.filter(item => item.firstPageData).length,
            data.filter(item => item.secondPageData).length
        );

        return data.slice(0, minLength).map(item => ({
            firstPageData: item.firstPageData || {},
            secondPageData: item.secondPageData || {}
        }));
    };

    const balancedData = modoComparacion && datos ? prepareBalancedData(datos) : null;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Scraper de Datos</h1>

            {!buscando && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                        onClick={() => handleFetchData(true, true)}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300"
                    >
                        Obtener datos de ambas páginas
                    </button>
                    <button
                        onClick={() => handleFetchData(true, false)}
                        className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 transition duration-300"
                    >
                        Obtener datos de la primera página
                    </button>
                    <button
                        onClick={() => handleFetchData(false, true)}
                        className="px-4 py-2 bg-rose-500 text-white font-semibold rounded-lg shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-opacity-75 transition duration-300"
                    >
                        Obtener datos de la segunda página
                    </button>
                </div>
            )}

            {buscando ? (
                <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
                    <p className="text-lg text-gray-700">Buscando resultados...</p>
                </div>
            ) : (
                <>
                    {datos && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Datos obtenidos:</h2>
                            {modoComparacion ? (
                                <div className="bg-white rounded-lg p-4 shadow-inner">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-left p-2 bg-gray-100">Primera Página</th>
                                                <th className="text-left p-2 bg-gray-100">Segunda Página</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {balancedData.map((item, index) => (
                                                <tr key={index} className="border-b border-gray-200">
                                                    <td className="p-2">
                                                        <span className="font-medium text-gray-800">{item.firstPageData?.team}</span>
                                                        {item.firstPageData?.quota && <span className="ml-2 text-blue-600">({item.firstPageData.quota})</span>}
                                                    </td>
                                                    <td className="p-2">
                                                        <span className="font-medium text-gray-800">{item.secondPageData?.team}</span>
                                                        {item.secondPageData?.quota && <span className="ml-2 text-emerald-600">({item.secondPageData.quota})</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <ul className="bg-white rounded-lg p-4 shadow-inner">
                                    {datos.map((item, index) => (
                                        <li key={index} className="mb-2 p-2 bg-gray-50 rounded shadow">
                                            {item.firstPageData && (
                                                <>
                                                    <span className="font-medium text-gray-800">{item.firstPageData.team}</span>
                                                    {item.firstPageData.quota && <span className="ml-2 text-blue-600">({item.firstPageData.quota})</span>}
                                                </>
                                            )}
                                            {item.secondPageData && (
                                                <>
                                                    <span className="font-medium text-gray-800">{item.secondPageData.team}</span>
                                                    {item.secondPageData.quota && <span className="ml-2 text-emerald-600">({item.secondPageData.quota})</span>}
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    <div className="text-sm text-gray-600">
                        <p>Hora de inicio: {horaInicio && horaInicio.toLocaleTimeString()}</p>
                        <p>Hora de fin: {horaFin && horaFin.toLocaleTimeString()}</p>
                    </div>
                </>
            )}
        </div>
    );
}
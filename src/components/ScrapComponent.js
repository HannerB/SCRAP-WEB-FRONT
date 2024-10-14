import React, { useState } from 'react';
import { fetchScrapData } from '../services/scrapService';
import { ArrowDownUp, Search, Clock } from 'lucide-react';

export default function ScrapComponent() {
    const [datos, setDatos] = useState(null);
    const [buscando, setBuscando] = useState(false);
    const [horaInicio, setHoraInicio] = useState(null);
    const [horaFin, setHoraFin] = useState(null);
    const [modoComparacion, setModoComparacion] = useState(false);
    const [modoVisualizacion, setModoVisualizacion] = useState('normal');

    const MAX_DISPLAY_ITEMS = 15;

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
        const firstPageData = data.filter(item => item.firstPageData).map(item => item.firstPageData);
        const secondPageData = data.filter(item => item.secondPageData).map(item => item.secondPageData);
        const minLength = Math.min(firstPageData.length, secondPageData.length, MAX_DISPLAY_ITEMS);
        return Array(minLength).fill().map((_, i) => ({
            firstPageData: firstPageData[i] || {},
            secondPageData: secondPageData[i] || {}
        }));
    };

    const prepareComparativeData = (data) => {
        if (!data || data.length === 0) return [];
        const firstPageData = data.filter(item => item.firstPageData).map(item => item.firstPageData);
        const secondPageData = data.filter(item => item.secondPageData).map(item => item.secondPageData);
        const comparativeData = firstPageData.reduce((acc, firstItem) => {
            const secondItem = secondPageData.find(item => item.team === firstItem.team);
            if (secondItem) {
                acc.push({
                    team: firstItem.team,
                    firstPageQuota: firstItem.quota,
                    secondPageQuota: secondItem.quota
                });
            }
            return acc;
        }, []);
        return comparativeData.slice(0, MAX_DISPLAY_ITEMS);
    };

    const prepareSinglePageData = (data) => {
        if (!data || data.length === 0) return [];
        const pageData = data.map(item => item.firstPageData || item.secondPageData).filter(Boolean);
        return pageData.slice(0, MAX_DISPLAY_ITEMS);
    };

    const balancedData = modoComparacion && datos ? prepareBalancedData(datos) : null;
    const singlePageData = !modoComparacion && datos ? prepareSinglePageData(datos) : null;
    const comparativeData = modoComparacion && datos ? prepareComparativeData(datos) : null;

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gray-100 rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">Análisis de Cuotas Deportivas</h1>

            {!buscando && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {['Ambas páginas', 'Primera página', 'Segunda página'].map((text, index) => (
                        <button
                            key={index}
                            onClick={() => handleFetchData(index === 0 || index === 1, index === 0 || index === 2)}
                            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-lg shadow-md hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1"
                        >
                            <Search className="inline-block mr-2" size={20} />
                            Obtener datos de {text}
                        </button>
                    ))}
                </div>
            )}

            {buscando ? (
                <div className="flex items-center justify-center p-10 bg-white rounded-lg shadow-inner">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mr-4"></div>
                    <p className="text-xl text-gray-700">Buscando resultados...</p>
                </div>
            ) : (
                <>
                    {datos && modoComparacion && (
                        <div className="mb-8 text-center">
                            <button
                                onClick={() => setModoVisualizacion(modo => modo === 'normal' ? 'comparativa' : 'normal')}
                                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg shadow-md hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1"
                            >
                                <ArrowDownUp className="inline-block mr-2" size={20} />
                                Cambiar a modo {modoVisualizacion === 'normal' ? 'comparativo' : 'normal'}
                            </button>
                        </div>
                    )}
                    {datos && (
                        <div className="mb-10 bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-2xl font-semibold text-gray-800">Datos obtenidos <span className="text-sm font-normal text-gray-500">(Mostrando hasta {MAX_DISPLAY_ITEMS} elementos)</span></h2>
                            </div>
                            <div className="p-6">
                                {modoComparacion ? (
                                    modoVisualizacion === 'normal' ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primera Página</th>
                                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segunda Página</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {balancedData.map((item, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="p-4">
                                                                <span className="font-medium text-gray-900">{item.firstPageData?.team}</span>
                                                                {item.firstPageData?.quota && <span className="ml-2 text-gray-600 font-semibold">({item.firstPageData.quota})</span>}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="font-medium text-gray-900">{item.secondPageData?.team}</span>
                                                                {item.secondPageData?.quota && <span className="ml-2 text-gray-600 font-semibold">({item.secondPageData.quota})</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota Primera Página</th>
                                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota Segunda Página</th>
                                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {comparativeData.map((item, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="p-4 font-medium text-gray-900">{item.team}</td>
                                                            <td className="p-4 text-gray-700 font-semibold">{item.firstPageQuota}</td>
                                                            <td className="p-4 text-gray-700 font-semibold">{item.secondPageQuota}</td>
                                                            <td className="p-4 text-gray-800 font-semibold">
                                                                {(parseFloat(item.firstPageQuota) - parseFloat(item.secondPageQuota)).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {singlePageData.map((item, index) => (
                                            <li key={index} className="py-4 flex items-center justify-between">
                                                <span className="text-lg font-medium text-gray-900">{item.team}</span>
                                                {item.quota && <span className="text-xl font-semibold text-gray-700">{item.quota}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                    {horaInicio && horaFin && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg shadow flex items-center justify-center space-x-4">
                            <Clock className="text-gray-400" size={20} />
                            <p>Inicio: {horaInicio.toLocaleTimeString()}</p>
                            <p>Fin: {horaFin.toLocaleTimeString()}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
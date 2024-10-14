export const fetchScrapData = async (fetchFirstPage, fetchSecondPage) => {
    const response = await fetch('http://localhost:3001/api/scrap/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fetchFirstPage, fetchSecondPage })
    });

    if (!response.ok) {
        throw new Error('Error al obtener los datos');
    }

    return await response.json();
};

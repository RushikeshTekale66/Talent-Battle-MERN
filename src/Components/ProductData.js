import React, { useEffect, useState } from 'react'

import { Chart } from "react-google-charts";

const TableData = () => {

    const [items, setItems] = useState([]);
    let [month, setMonth] = useState('');
    const [monthName, setMonthName] = useState('');
    const [chartData, setChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statisticData, setStatisticData] = useState('');


    // Handed the Page Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, items.length);
    const visibleData = items.slice(startIndex, endIndex);

    // Setted the month
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getMonth = (month) => {
        console.log("Selected Month is ", month);
        for (let i = 1; i <= months.length; i++) {
            if (month === i + 1) {
                setMonthName(months[i]);
            }
        }
    }

    // Table Data
    const handleSelectChange = (event) => {
        setMonth(event.target.value);
    };

    // Get data from selected month
    let getDataByMonth = async () => {
        let result = await fetch(`http://localhost:5000/search/month/${month}`);
        result = await result.json();
        setItems(result);
        console.log(result);
    }

    // Get all data 
    let getData = async () => {
        let result = await fetch(`http://localhost:5000/getalldata`);
        result = await result.json();
        setItems(result)
        console.log(result);

    }

    // searching data 
    const searchHandle = async (event) => {
        var key = event.target.value;
        console.log(key);
        if (key==='') {
            getDataByMonth();
        }
        else{
            let result = await fetch(`http://localhost:5000/search/${key}`);
            result = await result.json();
            if (result) {
                setItems(result);
            }
        }
    }

    // BarChart Data
    let getbardata = async () => {
        let result = await fetch(`http://localhost:5000/barchart?month=${month}`)
        const data = await result.json();
        console.log(data);
        const formattedData = formatData(data);
        setChartData(formattedData);
    }

    const formatData = (apiData) => {
        // Format the data from the API response into the format expected by Google Charts
        const formattedData = [['Range', 'Count']];
        Object.keys(apiData).forEach((range) => {
            formattedData.push([range, apiData[range]]);
        });
        return formattedData;
    };

    // PieChart Data
    const fetchPieData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/piechart/${month}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            console.log(data);

            const transformedData = Object.entries(data).map(([category, count]) => [category, count]);

            setPieChartData([['Category', 'Count'], ...transformedData]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    // Statistic Data
    let getStatisticData = async () => {
        let result = await fetch(`http://localhost:5000/saledata?month=${month}`);
        result = await result.json();
        setStatisticData(result);
        console.log(result);
    }

    useEffect(() => {
        if(visibleData.length===0){
            getDataByMonth();
        }
        if (!month) {
            setMonth(3);
            getMonth(month)
            getStatisticData();
            fetchPieData();
            getbardata();
            getDataByMonth();

        }
        else {
            getMonth(month)
            getStatisticData();
            fetchPieData();
            getbardata();
            getDataByMonth();
        }
    }, [month])

    return (
        <div >
            {/* Table Section */}
            <div className='d-inline-block container table-responsive  m-3'>
                <h1>Transaction Table</h1>

                <div className='d-inline-flex'>
                    <input className="p-2 m-2 search-product-box float-left" type="text" placeholder="search intem form table" onChange={searchHandle} />

                    <div className=' p-2 d-flex'>
                        <select className='bg-warning' id="options" value={month} onChange={handleSelectChange}>
                            <option value="">Select Month</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>

                </div>

                <table className='table table-bordered border-primary'>
                    <tr className='border bg-info'>
                        <th className='border'>Id</th>
                        <th className='border'>Title</th>
                        <th className='border'>Description</th>
                        <th className='border'>Price</th>
                        <th className='border'>Category</th>
                        <th className='border'>Sold</th>
                        <th className='border'>Image</th>
                    </tr>
                    {
                        items.length > 0 ? visibleData.map((item, index) =>
                            <tr className='border' key={item._id}>
                                <td className='border'>{item.id}</td>
                                <td className='border'>{item.title}</td>
                                <td className='border'>{item.description}</td>
                                <td className='border'>{item.price}</td>
                                <td className='border'>{item.category}</td>
                                <td className='border'>{item.sold.toString()}</td>
                                <td className='border'><a href={`${item.image}`} target='_blank'>Image Link</a></td>
                            </tr>
                        ) : <h4>Data is not provided</h4>
                    }

                </table>
                <div className="container d-flex justify-content-between" >
                    <button type="button" className="btn btn-danger" style={{ marginTop: '30px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>&larr; Previous</button>
                    <label style={{ marginTop: '30px' }}>Page No. {currentPage}</label>
                    <button type="button" className="btn btn-success" style={{ marginTop: '30px' }} disabled={endIndex >= items.length} onClick={() => setCurrentPage(currentPage + 1)}>Next &rarr;</button>
                </div>
                
            </div > 

            {/* BarChart */}
            <div className=' m-5 p-4 d-block'>
                <h1>Transaction Bar Chart</h1>
                <div className='d-inline-block' style={{ display: 'flex', maxWidth: 900 }} >
                    <Chart
                        width={'900px'}
                        height={'300px'}
                        chartType="ColumnChart"
                        loader={<div>Loading Chart</div>}
                        data={chartData}
                        options={{
                            title: `Bar Chart for ${monthName}`,
                            chartArea: { width: '60%' },
                            backgroundColor: '#f0f0f0',
                            hAxis: {
                                title: 'Price range for item sold',
                            },
                            vAxis: {
                                title: 'Number of items sold',
                                ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                                minValue: 0,
                            },
                        }}
                    />
                </div>
            </div>

                {/* Pie Chart & Static Data */}
            <div className='d-inline-block container '>
                {/* Pie Chart */}
                <div className='m-2 d-inline-block' style={{ width: '100%', maxWidth: 600 }}>
                    {loading ? (
                        <div>Loading Chart...</div>
                    ) : (
                        <Chart
                            width={'100%'}
                            height={'400px'}
                            chartType="PieChart"
                            data={pieChartData}
                            options={{
                                title: `Statistic for Type of items sold/Unsold ${monthName}`,
                            }}
                        />
                    )}
                </div>

                {/* Statistic Data */}
                <div className='container border m-2 p-4'>
                    <h3>Statistic Analysis of items for {monthName}</h3>
                    <div className='bg-info rounded-3 p-4'>
                        <p className='fs-2'><strong>Total Sale </strong>= {Math.floor(statisticData.total_sale_amount)}</p>
                        <p className='fs-3'><strong>Total Item Sold </strong>= {statisticData.total_items_sold}</p>
                        <p className='fs-3'><strong>Total Item Not Sold </strong> = {statisticData.total_items_not_sold}</p>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default TableData
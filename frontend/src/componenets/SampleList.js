import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_SAMPLES } from '../graphql/queries';

function SampleList() {
    const { loading, error, data } = useQuery(GET_SAMPLES);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return (
        <div>
            <h2>Sample List</h2>
            <ul>
                {data.samples.map(sample => (
                    <li key={sample.id}>
                        {sample.name} - {sample.identifier}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SampleList
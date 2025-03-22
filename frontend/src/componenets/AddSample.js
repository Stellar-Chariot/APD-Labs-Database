import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_SAMPLE } from '../graphql/mutations';

function AddSample() {
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [addSample] = useMutation(ADD_SAMPLE);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await addSample({variables: {name, identifier}});
        setName('');
        setIdentifier('');
    }; 

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Sample Name"
            />
            <button type="Submit">Add Sample</button>
        </form>
    );
}

export default AddSample;

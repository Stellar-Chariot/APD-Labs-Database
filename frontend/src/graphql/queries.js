import { gql } from '@apollo/client';

export const GET_SAMPLES = gql`
    query GetSamples {
        samples {
            id
            name
            identifier
            substrate
            grower
        }
    }
`;
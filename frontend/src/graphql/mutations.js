import { gql } from '@apollo/client';

export const ADD_SAMPLE = gql`
mutation AddSample($name: String!, $identifier: String!) {
    addSample(name: $name, identifier: $identifier) {
        id
        name
        identifier
    }
}`
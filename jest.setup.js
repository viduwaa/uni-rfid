// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('@/components/PageHeader', () => ({
    __esModule: true,
    default: ({ title, subtitle }) => (
        <div data-testid="page-header">
            {title ? (typeof title === 'string' ? <h1>{title}</h1> : title) : null}
            {subtitle ? (typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle) : null}
        </div>
    ),
}));

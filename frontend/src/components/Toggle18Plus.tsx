
import React from 'react';

interface Toggle18PlusProps {
    is18Plus: boolean;
    onToggle: (checked: boolean) => void;
}

const Toggle18Plus: React.FC<Toggle18PlusProps> = ({ is18Plus, onToggle }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd'
        }}>
            <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                color: is18Plus ? '#d32f2f' : '#333'
            }}>
                <input
                    type="checkbox"
                    checked={is18Plus}
                    onChange={(e) => onToggle(e.target.checked)}
                    style={{ width: '20px', height: '20px', marginRight: '10px' }}
                />
                18+ Content {is18Plus ? '(Enabled)' : '(Disabled)'}
            </label>
        </div>
    );
};

export default Toggle18Plus;

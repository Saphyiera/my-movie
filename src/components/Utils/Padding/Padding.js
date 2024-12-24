import React from 'react';
import PropTypes from 'prop-types';

/**
 * Padding Component
 * A reusable wrapper component to apply consistent padding.
 *
 * Props:
 * - padding: applies equal padding to all sides (e.g., "10px", "1rem")
 * - paddingX: applies horizontal padding (left & right)
 * - paddingY: applies vertical padding (top & bottom)
 * - paddingTop, paddingBottom, paddingLeft, paddingRight: individual padding values
 */
const Padding = ({
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    children,
    style = { backgroundColor: '#f4f4f4' },
    className = '',
}) => {
    const combinedStyle = {
        padding: padding || undefined,
        paddingTop: paddingTop || paddingY || undefined,
        paddingBottom: paddingBottom || paddingY || undefined,
        paddingLeft: paddingLeft || paddingX || undefined,
        paddingRight: paddingRight || paddingX || undefined,
        ...style,
    };

    return (
        <div className={className} style={combinedStyle}>
            {children}
        </div>
    );
};

Padding.propTypes = {
    padding: PropTypes.string,
    paddingX: PropTypes.string,
    paddingY: PropTypes.string,
    paddingTop: PropTypes.string,
    paddingBottom: PropTypes.string,
    paddingLeft: PropTypes.string,
    paddingRight: PropTypes.string,
    children: PropTypes.node,
    style: PropTypes.object,
    className: PropTypes.string,
};

export default Padding;

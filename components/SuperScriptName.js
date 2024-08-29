import React from 'react';

const SuperscriptedName = ({ name }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: name }}
    />
  );
};

export default SuperscriptedName;

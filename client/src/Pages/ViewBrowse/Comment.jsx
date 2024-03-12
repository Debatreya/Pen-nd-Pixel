import React from 'react'

const Comment = () => {
  return (
    <>
        <div className='comment'>
            <h1>Leave a Comment</h1>
            <input
                type="text"
                placeholder="Name"
                className="border border-gray-300 p-2 mb-2"
            />
      <br />
            <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 p-2 mb-2"
            />
      <br />
            <textarea
                placeholder="Comment"
                className="border border-gray-300 p-2 mb-2"
            />
    
        </div>
        <button onClick={() => console.log('Button clicked')}>Post Comment</button>
    </>
  )
}

export default Comment
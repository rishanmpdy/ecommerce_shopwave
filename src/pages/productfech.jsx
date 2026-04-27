import React, { useEffect, useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);

  useEffect(() => {
    fetch("https://dummyjson.com/todos")
      .then((res) => res.json())
      .then((data) => {setTodos(data.todos); 
        const filtered = data.todos.filter((item) => item.completed === true);
        setCompletedTodos(filtered);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      {completedTodos.map((item) => (
        <p key={item.id}>{item.todo}</p>
      ))}
    </div>
  );
}




export default TodoList;

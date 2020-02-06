//function to handle reducer composition 
//one reducer to call another reducer to 
//update items inside an array.

const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };
        case 'TOGGLE_TODO':
            if (state.id !== action.id) {
                return state;
            }
            return {
                ...state,
                completed: !state.completed
            };
        default:
            return state;
    }
}


//reducer having a state and an action
// if action.type == 'ADD_TODO' we return a new array 
// where the previous state is copied and a next state is 
// appended to it

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [...state,
            todo(undefined, action)
            ];
        case 'TOGGLE_TODO':
            return state.map(t => todo(t, action));
        default:
            return state;
    }
};

//to show the states based on visibility.
const visibilityFilter =
    (state = 'SHOW_ALL', action) => {
        switch (action.type) {
            case 'SET_VISIBILITY_FILTER':
                return action.filter;
            default:
                return state;
        }
    }

//single reducer that calls many reducers.
const { combineReducers } = Redux;
const todoApp = combineReducers({
    todos, //same as todos:todos
    visibilityFilter//follows es3 shorthand notation
})
// const todoApp = (state ={}, action)=>{
//   return {
//     todos:todos(
//       state.todos,
//       action
//     ),
//     visibilityFilter:visibilityFilter(
//       state.visibilityFilter,
//       action
//     )
//   };
// };

//creating a store with this reducer.

const { createStore } = Redux;
const store = createStore(todoApp);

console.log("initial state.");
console.log(store.getState());
console.log('--------------');

console.log("dispatching ADD_TODO");
store.dispatch({
  type:'ADD_TODO',
  id:0,
  text:'Learn Redux'
});

console.log("current state.");
console.log(store.getState());
console.log('--------------');

console.log("dispatching ADD_TODO");
store.dispatch({
  type:'ADD_TODO',
  id:1,
  text:'go shopping'
});

console.log("current state.");
console.log(store.getState());
console.log('--------------');


console.log("dispatching TOGGLE_TODO");
store.dispatch({
  type:'TOGGLE_TODO',
  id:0,
});


console.log("current state.");
console.log(store.getState());
console.log('--------------');


// function where the state before is an empty array 
// hence the state after should match the action being performed.
// we use deepFreeze to avoid mutation as it should be pure.

const testAddTodo = () => {
  const stateBefore =[];
  const action = {
    type:'ADD_TODO',
    id:0,
    text:'Learn Redux' 
  };
  const stateAfter=[{
    id:0,
    text:'Learn Redux',
    completed:false
  }
                   ];
  deepFreeze(stateBefore);
  deepFreeze(action);
  expect(
    todos(stateBefore,action)
  ).toEqual(stateAfter);
};

//function where we want only a part to change after a 
//certain action.
const testToggleTodo =()=>
{
  const stateBefore = [
    {
      id:0,
      type:'TOGGLE_TODO',
      completed:false
    },
    {
      id:1,
      type:'TOGGLE_TODO',
      completed:false
    }
   ];
  const action = {
      id:1,
      type:'TOGGLE_TODO',
      completed:true
  }
  const stateAfter=[
    {
      id:0,
      type:'TOGGLE_TODO',
      completed:false
    },
    {
      id:1,
      type:'TOGGLE_TODO',
      completed:true
    }
  ];

  deepFreeze(stateBefore);
  deepFreeze(action);
  expect(
    todos(stateBefore,action)
  ).toEqual(stateAfter);

}
testAddTodo();
testToggleTodo();

console.log('--------------');


console.log("Dispatching SET_VISIBIITY_FILTER");
store.dispatch({
  type:'SET_VISIBILITY_FILTER',
  filter:'SHOW_COMPLETED'
});


console.log("current state.");
console.log(store.getState());
console.log('--------------');


console.log("All tests passed")

const { Component } = React;

const FilterLink = ({
    filter, children,currentFilter
}) => {
  if(filter === currentFilter){
    return <span>{children}</span>
  }
    return(
    <a href='#'
        onClick={e => {
            e.preventDefault();
            store.dispatch({
                type: 'SET_VISIBILITY_FILTER',
                filter
            });
        }}
    >
        {children}
        </a>
    );
};

const getVisibleTodos=(
todos,
filter
)=>{
  switch(filter){
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
       return todos.filter(
       t => !t.completed
       );
  }
}

let nextTodoId = 0;

class TodoApp extends Component {
    render() {
      const {
        todos,
        visibilityFilter}=this.props;
      
      const visibleTodos = getVisibleTodos(
      todos,
      visibilityFilter
      );
        return (
            <div>
                <input ref={node => {
                    this.input = node;
                }} />
                <button onClick={() => {
                    store.dispatch({
                        type: 'ADD_TODO',
                        text: this.input.value,
                        id: nextTodoId++
                    });
                    this.input.value = '';
                }}>
                    Add Todo
        </button>
                <ul>
                    {visibleTodos.map(todo =>
                        <li key={todo.id}
                            onClick={() => {
                                store.dispatch({
                                    type: 'TOGGLE_TODO',
                                    id: todo.id
                                })
                            }
                            }
                            style={{
                                textDecoration:
                                    todo.completed ?
                                        'line-through' :
                                        'none'
                            }}
                        >
                            {todo.text}
                        </li>
                    )}
                </ul>
                
                <p>
                    Show:
                 {''}
                    <FilterLink filter="SHOW_ALL"
                      currentFilter={visibilityFilter}>
                        All
                    </FilterLink>
                            {' '}
                    <FilterLink filter="SHOW_ACTIVE"
                      currentFilter={visibilityFilter}>
                                Active
                    </FilterLink>
                                    {' '}
                                    <FilterLink filter="SHOW_COMPLETED"
                                    currentFilter={visibilityFilter}>
                                        Completed
                    </FilterLink>
                </p>
                </div>
                          );
                                }
                            }

const render = () => {
                                        ReactDOM.render(
                                            <TodoApp
                                               { ...store.getState()}/>,
                                            document.getElementById('root')
                                        );
    };
    
    store.subscribe(render);
    render();
    

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const calendar = document.getElementById('calendar');

let tasks = [];

// Fetch tasks from backend
async function fetchTasks() {
  const res = await fetch('/api/tasks');
  tasks = await res.json();
  renderTasks();
  renderCalendar();
}

// Render task list
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'border border-gray-300 rounded p-3 flex justify-between items-center';

    const taskInfo = document.createElement('div');
    taskInfo.innerHTML = `<strong>${task.title}</strong><br/><small>${task.description || ''}</small><br/><small>Due: ${task.due_date || 'N/A'}</small>`;

    const actions = document.createElement('div');
    actions.className = 'space-x-2';

    const completeBtn = document.createElement('button');
    completeBtn.innerHTML = task.completed ? '<i class="fas fa-check-circle text-green-600"></i>' : '<i class="far fa-circle"></i>';
    completeBtn.title = 'Toggle Complete';
    completeBtn.className = 'focus:outline-none';
    completeBtn.addEventListener('click', () => toggleComplete(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash text-red-600"></i>';
    deleteBtn.title = 'Delete Task';
    deleteBtn.className = 'focus:outline-none';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskInfo);
    li.appendChild(actions);

    taskList.appendChild(li);
  });
}

// Render simple calendar showing tasks by due date
function renderCalendar() {
  calendar.innerHTML = '';
  if (tasks.length === 0) {
    calendar.textContent = 'No tasks to display on calendar.';
    return;
  }

  // Group tasks by due_date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      if (!acc[task.due_date]) acc[task.due_date] = [];
      acc[task.due_date].push(task);
    }
    return acc;
  }, {});

  const dates = Object.keys(tasksByDate).sort();

  dates.forEach(date => {
    const dateDiv = document.createElement('div');
    dateDiv.className = 'mb-4';

    const dateHeader = document.createElement('h3');
    dateHeader.className = 'font-semibold text-lg mb-1';
    dateHeader.textContent = new Date(date).toDateString();

    const ul = document.createElement('ul');
    ul.className = 'list-disc list-inside';

    tasksByDate[date].forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.title + (task.completed ? ' (Completed)' : '');
      ul.appendChild(li);
    });

    dateDiv.appendChild(dateHeader);
    dateDiv.appendChild(ul);
    calendar.appendChild(dateDiv);
  });
}

// Add new task
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const due_date = document.getElementById('due_date').value;

  if (!title) return alert('Task title is required.');

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, due_date })
  });

  if (res.ok) {
    taskForm.reset();
    fetchTasks();
  } else {
    alert('Failed to add task.');
  }
});

// Toggle task completion
async function toggleComplete(task) {
  const updatedTask = { ...task, completed: !task.completed };
  const res = await fetch(`/api/tasks/${task.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask)
  });
  if (res.ok) {
    fetchTasks();
  } else {
    alert('Failed to update task.');
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (res.ok) {
    fetchTasks();
  } else {
    alert('Failed to delete task.');
  }
}

// Initial fetch
fetchTasks();

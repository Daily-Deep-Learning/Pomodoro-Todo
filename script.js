document.addEventListener('DOMContentLoaded', function () {
    const todoInput = document.getElementById('inputTask');
    const taskList = document.getElementById('taskList');
    const todoButton = document.getElementById('addTask');
    const taskSelect = document.getElementById('taskSelector');
    const timeInput = document.getElementById('timeInput');
    const timerDisplay = document.getElementById('timer');
    const startButton = document.getElementById('startTimer');
    const pauseButton = document.getElementById('pauseTimer');
    const resetButton = document.getElementById('resetTimer');
    const finishButton = document.getElementById('finishTimer');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let countdown;
    let isPaused = false;
    let remainingTime;
    let selectedTask = null;

    // Initialize tasks and dropdown on page load
    tasks.forEach(task => {
        if (!task.completed) {
            addTaskToDropdown(task);
        }
    });

    tasks.forEach(task => renderTasks(task));

    todoButton.addEventListener('click', addTask);

    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Add task to list and dropdown
    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === '') {
            return;
        }
        const newTask = {
            id: Date.now(), 
            text: taskText,
            completed: false,
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks(newTask);
        addTaskToDropdown(newTask);  // Add task to the dropdown immediately
        todoInput.value = '';
    }

    // Render task in the list
    function renderTasks(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.classList.add('task-item');

        const span = document.createElement('span');
        span.textContent = task.text;

        const button = document.createElement('button');
        button.textContent = 'Delete';
        button.classList.add('task-button');

        li.appendChild(span);
        li.appendChild(button);

        if (task.completed) {
            li.classList.add('completed');
        }

        li.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            task.completed = !task.completed;
            li.classList.toggle('completed');
            saveTasks();
            updateTaskInDropdown(task);  // Update task status in dropdown
        });

        button.addEventListener('click', (e) => {
            e.stopPropagation(); 
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            li.remove();
            removeTaskFromDropdown(task);
        });

        taskList.appendChild(li);
    }

    // Add task to the dropdown
    function addTaskToDropdown(task) {
        const option = new Option(task.text, task.id);
        taskSelect.appendChild(option);
    }

    // Remove task from dropdown
    function removeTaskFromDropdown(task) {
        const options = Array.from(taskSelect.options);
        const optionToRemove = options.find(opt => parseInt(opt.value) === task.id);
        if (optionToRemove) {
            taskSelect.removeChild(optionToRemove);
        }
    }

    // Update task in dropdown based on completion status
    function updateTaskInDropdown(task) {
        if (task.completed) {
            removeTaskFromDropdown(task);
        } else {
            addTaskToDropdown(task);
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Pomodoro timer functionality
    function startTimer(duration) {
        let timer = duration, minutes, seconds;
        countdown = setInterval(function () {
            if (!isPaused) {
                minutes = Math.floor(timer / 60);
                seconds = timer % 60;
                timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                if (--timer < 0) {
                    clearInterval(countdown);
                    completeTask();
                }
            }
        }, 1000);
    }

    function completeTask() {
        alert('Time is up! Task completed.');
        if (selectedTask) {
            // Mark the task as completed
            selectedTask.completed = true;
            saveTasks();
    
            // Remove the old task element
            const taskElement = document.querySelector(`[data-id="${selectedTask.id}"]`);
            if (taskElement) {
                taskElement.remove();
            }
    
            // Re-render the task with updated status
            renderTasks(selectedTask);
    
            // Remove the task from the dropdown
            updateTaskInDropdown(selectedTask);
        }
        resetPomodoro();
    }
    

    function resetPomodoro() {
        clearInterval(countdown);
        isPaused = false;
        timerDisplay.style.display = 'none';
        timeInput.style.display = 'inline';  // Show input again
        timeInput.value = '';  // Clear the input
        taskSelect.disabled = false;  // Re-enable task selection
        startButton.disabled = false;
        pauseButton.disabled = true;
        resetButton.disabled = true;
        finishButton.disabled = true;
        timerDisplay.textContent = '25:00';  // Reset the display
    }

    startButton.addEventListener('click', function () {
        let timeInMinutes = parseInt(timeInput.value) || 25;  // Default to 25 minutes if input is empty
        if (!taskSelect.value) {
            alert('Please select a task!');
            return;
        }
        selectedTask = tasks.find(t => t.id == taskSelect.value);  // Get selected task
        if (!selectedTask) {
            alert('Invalid task selected!');
            return;
        }

        remainingTime = timeInMinutes * 60;  // Convert to seconds
        startTimer(remainingTime);

        // Disable inputs once the timer starts
        timeInput.style.display = 'none';  // Hide input after starting
        timerDisplay.style.display = 'block';  // Show countdown
        taskSelect.disabled = true;  // Disable task selection when timer is running
        startButton.disabled = true;
        pauseButton.disabled = false;
        resetButton.disabled = false;
        finishButton.disabled = false;
    });

    pauseButton.addEventListener('click', function () {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    });

    resetButton.addEventListener('click', function () {
        resetPomodoro();
    });

    finishButton.addEventListener('click', function () {
        completeTask();  // Mark task as completed and reset everything
    });
});
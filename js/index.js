

const ProjectFactory = (projectName, tasks = []) => {
    return {
        projectName,
        tasks,
    }
}


const TaskFactory = (name, description, dueDate, priority, createdAt) => {
    return {
        name,
        description,
        dueDate,
        priority,
        createdAt,
        status: 0
    }
}



const ProjectModule = function () {
    const PROJECT_KEY = 'PROJECT_KEY'
    let projects = localStorage.getItem(PROJECT_KEY) === null ? [] : JSON.parse(localStorage.getItem(PROJECT_KEY))

    const createProject = (name) => {
        projects.push(ProjectFactory(name));
        saveProjectsToLocalStorage()
    }

    const addTaskToProject = (projectId, task) => {
        projects[projectId].tasks.push(task)
        saveProjectsToLocalStorage();
    }

    const fetchTask = (projectId, taskStatus) => {
        return projects[projectId].tasks.filter(task => task.status === taskStatus)
    }

    const fetchProjects = () => projects

    const saveProjectsToLocalStorage = () => {
        localStorage.setItem(PROJECT_KEY, JSON.stringify(projects))
    }
    const setProjects = (_projects) => {
        projects = _projects
        saveProjectsToLocalStorage()
    }

    const removeTask = (projectId, taskId) => {
        const newTask = projects[projectId].tasks.filter((task, index) => index !== taskId)
        projects[projectId].tasks = [];
        newTask.map(task => addTaskToProject(projectId, task))

    }


    return {
        createProject,
        addTaskToProject,
        fetchTask,
        fetchProjects,
        setProjects,
        removeTask
    }
}();


const EventModule = function () {

    const attachEventToProject = (projects) => {
        for (let i = 0; i < projects.length; i ++) {
            document.querySelector(`#projects-ul li[data-project-id="${i}"]`).onclick = (e) => {
                const index = e.target.getAttribute('data-project-id');
                projects.map((project, index) => UIModule.removeProjectActive(index))
                UIModule.makeProjectActive(index)
                eventToFectchTask(index)
            }
        }
    }
    const openModalToCreateTask = () => {
        const modal = document.getElementById('task-myModal');
        const btn = document.getElementById("taskmyBtn");
        const span = document.getElementsByClassName("close")[1];
        btn.onclick = function() {
            modal.style.display = "block";
        }
        span.onclick = function() {
            document.getElementById('existing_task_id').value = -1
            modal.style.display = "none";
        }

    }
    const openModalToCreateProject = () => {
        const modal = document.getElementById('myModal');
        const btn = document.getElementById("myBtn");
        const span = document.getElementsByClassName("close")[0];
        btn.onclick = function() {
            modal.style.display = "block";
        }
        span.onclick = function() {
            modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
    const eventToCloseModal = () => {
        document.getElementById('myModal').style.display = "none"
    }
    const eventCloseTaskModal = () => {
        document.getElementById('task-myModal').style.display = "none";
    }

    const eventToCreateProject = (e) => {
        e.preventDefault()
        const projectName = document.getElementById('new-project-name').value
        ProjectModule.createProject(projectName);
        UIModule.renderProjectList(ProjectModule.fetchProjects());
        eventToCloseModal();
        attachEventToProject(ProjectModule.fetchProjects())
    }

    const eventToCreateTask = (e) => {
        e.preventDefault()
        const projectId = document.getElementById('project_task_relation_id').value
        if (projectId < 0 ) {
            alert('Please select a project')
            return
        }
        const taskName = document.getElementById('new-task-name').value
        const taskDescription = document.getElementById('new-task-desc').value
        const taskDueDate = document.getElementById('new-task-due-date').value
        const taskPriority = document.getElementById('new-task-priority').value

        const existingTaskId = document.getElementById('existing_task_id').value
        if (existingTaskId > -1) {
            ProjectModule.removeTask(parseInt(projectId), parseInt(existingTaskId))
        }

        const task = TaskFactory(taskName, taskDescription, taskDueDate, taskPriority, new Date());
        ProjectModule.addTaskToProject(projectId, task);
        eventCloseTaskModal();
        eventToFectchTask(projectId)
    }

    const eventToFectchTask = (projectId) => {
        const status = 0
        const tasks = ProjectModule.fetchTask(projectId, status);

        const taskTemplate = tasks.reduce((taskRows, task, index) => {
            return `${taskRows}
                <tr>
                    <td>${index + 1}</td>
                    <td>${task.name}</td>
                    <td>${task.description}</td>
                    <td>${task.dueDate}</td>
                    <td>${task.priority}</td>
                    <td>${task.createdAt}</td>
                    <td>
                        <button data-task-id="${index}" class="view-task-btn small-button button-wrap-content">View</button>
                        <button data-task-id="${index}" class="delete-task-btn small-button button-wrap-content">Delete</button>
                    </td>
                </tr>
            `
        }, '');
        document.getElementById('task-list-table-body').innerHTML = taskTemplate;
        attachEventsToTask();
    }

    const attachEventsToTask = () => {
        const projectId = document.getElementById('project_task_relation_id').value

        const tasks = ProjectModule.fetchTask(projectId, 0)
        for (let i = 0; i < tasks.length; i ++) {
            document.querySelector(`.view-task-btn[data-task-id="${i}"]`).onclick = (e) => {
                const modal = document.getElementById('task-myModal');
                modal.style.display = "block";
                document.getElementById('existing_task_id').value = i
                const task = ProjectModule.fetchTask(projectId, 0)[i]

                document.getElementById('new-task-name').value = task.name

                document.getElementById('new-task-desc').value = task.description
                document.getElementById('new-task-due-date').value = task.dueDate
                document.getElementById('new-task-priority').value = task.priority

            }
            document.querySelector(`.delete-task-btn[data-task-id="${i}"]`).onclick = (e) => {
                ProjectModule.removeTask(projectId, i)
                eventToFectchTask(projectId)
            }

        }
    }


    return {
        attachEvents: () => {
            openModalToCreateTask();
            openModalToCreateProject()
            document.getElementById('create-project-button').addEventListener('click', eventToCreateProject);
            document.getElementById('create-task-button').addEventListener('click', eventToCreateTask)

            attachEventToProject(ProjectModule.fetchProjects())

        },
        attachEventToProject
    }
}();

const UIModule = function(){
    const makeProjectActive = (projectId) => {
        document.querySelector(`#projects-ul [data-project-id="${projectId}"]`).classList.add("active")
        document.querySelector('#project_task_relation_id').value = projectId
    }
    const removeProjectActive = (projectId) => {

        document.querySelector(`#projects-ul [data-project-id="${projectId}"]`).classList.remove("active")
    }
    const renderProjectList = (projects) => {

        const projectListTemplate = projects.reduce((projectRows, project, projectIndex) => {
            return `${projectRows}
                <li class="list-group-item project-item" data-project-id="${projectIndex}">
                    <a>
                        <h6 data-project-id="${projectIndex}" class="message-list-title">${project.projectName}</h6>
                    </a>
                </li>
            `
        }, '');

        document.getElementById('projects-ul').innerHTML = projectListTemplate
    }

    return {
        init: () => {
            renderProjectList(ProjectModule.fetchProjects())
        },
        renderProjectList,
        makeProjectActive,
        removeProjectActive
    }
}();
UIModule.init()
EventModule.attachEvents()

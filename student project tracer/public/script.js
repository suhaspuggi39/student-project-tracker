
const STORAGE_KEY = 'workshop-projects-v1';

const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');

// This array holds the current project records.
const projects = [];

// null means the form is in Add mode.
let editingId = null;

// Prevent saving over data that could not be safely loaded.
let storageWritesBlocked = false;

// Show a message without interpreting it as HTML.
function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// Check that every saved project has the expected structure.
function isValidProjectArray(data) {
    if (!Array.isArray(data)) {
        return false;
    }

    const ids = new Set();
    const validStatuses = ['Planned', 'In Progress', 'Completed'];

    return data.every(project => {
        if (
            project === null ||
            typeof project !== 'object' ||
            Array.isArray(project) ||
            typeof project.id !== 'string' ||
            project.id.trim() === '' ||
            typeof project.name !== 'string' ||
            project.name.trim() === '' ||
            !validStatuses.includes(project.status) ||
            ids.has(project.id)
        ) {
            return false;
        }

        ids.add(project.id);
        return true;
    });
}

// Restore saved projects when the page starts.
function loadProjects() {
    try {
        const savedText = window.localStorage.getItem(STORAGE_KEY);

        // No saved value means this is a fresh project list.
        if (savedText === null) {
            return;
        }

        // Turn the stored text back into JavaScript data.
        const savedProjects = JSON.parse(savedText);

        if (!isValidProjectArray(savedProjects)) {
            storageWritesBlocked = true;
            showMessage(
                'Saved project data is invalid. It has not been changed, ' +
                'and changes cannot be saved until the stored data is fixed.'
            );
            return;
        }

        // Restore only the fields used by this app.
        savedProjects.forEach(project => {
            projects.push({
                id: project.id,
                name: project.name,
                status: project.status
            });
        });
    } catch (error) {
        storageWritesBlocked = true;
        showMessage(
            'Could not read saved projects. Existing stored data has not ' +
            'been changed, and changes cannot be saved in this session.'
        );
    }
}

// Save the current project array as text.
function saveProjects() {
    if (storageWritesBlocked) {
        showMessage(
            'Changes could not be saved because the existing stored data ' +
            'could not be loaded safely.'
        );
        return false;
    }

    try {
        // Turn the project array into text for localStorage.
        const savedText = JSON.stringify(projects);
        window.localStorage.setItem(STORAGE_KEY, savedText);
        showMessage('Projects saved successfully.');
        return true;
    } catch (error) {
        showMessage(
            'Changes could not be saved to browser storage. ' +
            'Your changes are only available in this page for now.'
        );
        return false;
    }
}

// Generate a unique ID for each new project.
function generateProjectId() {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Return the form to Add mode.
function resetForm() {
    form.reset();
    editingId = null;
    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;
}

// Display all projects and their action buttons.
function renderProjects() {
    projectList.replaceChildren();

    projects.forEach(project => {
        const listItem = document.createElement('li');
        listItem.dataset.projectId = project.id;

        const projectName = document.createElement('h3');
        projectName.textContent = project.name;

        const projectStatus = document.createElement('p');
        projectStatus.textContent = `Status: ${project.status}`;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            startEditing(project.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteProject(project.id);
        });

        listItem.append(
            projectName,
            projectStatus,
            editButton,
            deleteButton
        );

        projectList.appendChild(listItem);
    });

    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }
}

// Load a project into the form for editing.
function startEditing(id) {
    const project = projects.find(item => item.id === id);

    if (!project) {
        return;
    }

    editingId = project.id;
    nameInput.value = project.name;
    statusInput.value = project.status;

    saveButton.textContent = 'Save changes';
    cancelButton.hidden = false;
    showMessage('');

    nameInput.focus();
}

// Delete exactly the project identified by its ID.
function deleteProject(id) {
    const projectIndex = projects.findIndex(item => item.id === id);

    if (projectIndex === -1) {
        return;
    }

    const project = projects[projectIndex];

    const confirmed = window.confirm(
        `Delete project "${project.name}"?`
    );

    // A cancelled deletion does not change or save the projects.
    if (!confirmed) {
        return;
    }

    // If the deleted project is being edited, leave Edit mode.
    if (editingId === id) {
        resetForm();
    }

    projects.splice(projectIndex, 1);

    renderProjects();
    saveProjects();
}

// Handle both adding and updating projects.
form.addEventListener('submit', event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (!name) {
        showMessage('Please enter a project name.');
        nameInput.focus();
        return;
    }

    if (editingId !== null) {
        const project = projects.find(item => item.id === editingId);

        if (!project) {
            resetForm();
            renderProjects();
            showMessage('That project could not be found.');
            return;
        }

        // Update the existing project without changing its ID.
        project.name = name;
        project.status = status;
    } else {
        // Add a new project.
        projects.push({
            id: generateProjectId(),
            name: name,
            status: status
        });
    }

    renderProjects();
    resetForm();

    // Save only project records, never unfinished form text.
    saveProjects();
    nameInput.focus();
});

// Cancel editing without changing or saving the project.
cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('');
});

// Restore saved data before displaying the list.
loadProjects();
renderProjects();







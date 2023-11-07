var currentPlans = [];
var currentDeadlines = [];

function hideAll(){
    for (var x of currentPlans){
        if (x.hideHTML == undefined) continue;
        x.hideHTML();
    }
    for (var x of currentDeadlines){
        if (x.hideHTML == undefined) continue;
        x.hideHTML();
    }
}

function createPlan(){
    var name = prompt("Name of plan?", "");
    var settings = name == "" ? {} : {name};
    var p = new Plan(settings);
    p.init();
    currentPlans.push(p);
    SaveAll();
}

function createDeadline(){
    var name = prompt("Name of deadline?", "");
    var settings = name == "" ? {} : {name};
    var p = new Deadline(settings);
    p.init();
    currentDeadlines.push(p);
    SaveAll();
}

document.getElementById('save-data').addEventListener('click', SaveAll);

function SaveAll(){
    var saving = {};
    saving["plan"] = [];
    saving["deadline"] = [];
    for (var x of currentPlans){
        saving.plan.push(x.settingsRefresh());
    }
    for (var x of currentDeadlines){
        saving.deadline.push(x.settingsRefresh());
    }
    localStorage.setItem("data", JSON.stringify(saving));
    return saving;
}

function LoadAll(){
    var data = localStorage.getItem('data');
    if (data != null){
        var saving = JSON.parse(data);
        currentPlans = saving.plan;
        currentDeadlines = saving.deadline;
        currentPlans.forEach((t, index) => {
            currentPlans[index] = new Plan(t);
            currentPlans[index].init();
            currentPlans[index].load();
        });
        currentDeadlines.forEach((t, index) => {
            currentDeadlines[index] = new Deadline(t);
            currentDeadlines[index].init();
            currentDeadlines[index].load();
        });
    }
}

document.getElementById("plan-button").addEventListener('click', createPlan);
document.getElementById("deadline-button").addEventListener('click', createDeadline);

class HTMLElement{
    constructor(elm='div'){
        this.html = document.createElement(elm);
    }

    toggleClass(classname){
        this.html.classList.toggle(classname);
    }

    hideHTML(){
        this.html.style.display = 'none';
    }

    showHTML(){
        this.html.style.display = 'block';
    }
}

class Task extends HTMLElement{
    constructor(settings = {}){
        super();
        this.name = "Task";
        this.description = "This is the default text";
        this.goal = 10;
        this.current = 0;
        this.refresh = "daily";
        this.complete = false;
        this.parent = settings.parent;
        this.id = "";
        for (var x of Object.keys(settings)) {
            if (x == 'html') continue;
            this[x] = settings[x];
        }
        for (var i = 0; i < 100; i++) this.id += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)];
    }

    init(){
        this.html = document.createElement("div");
        this.parent.taskList.appendChild(this.html);
        this.html.outerHTML = `<div class="task" id="${this.id}">
            <div class="task-information">
                <div class="task-name" id="${this.id}n" contenteditable=true>${this.name}</div>
                <div class="task-description" id="${this.id}d" contenteditable=true>${this.description}</div>
                <div><span contenteditable=true id="${this.id}c">${this.current}</span> out of <span contenteditable=true id="${this.id}g">${this.goal}</span></div>
            </div>
            <div class="task-buttons">
                <button class="task-remove" id="${this.id}r"><span class="material-symbols-outlined">
                        delete
                    </span></button>
            </div>
        </div>`;
        this.html = document.getElementById(this.id);
        this.remove = document.getElementById(this.id + "r");
        this.remove.addEventListener("click", (e) => {
            this.deleteHTML();
        });
        document.getElementById(this.id+'n').addEventListener('keyup', (e) => {
            this.name = document.getElementById(this.id+'n').innerHTML;
        });
        document.getElementById(this.id+'d').addEventListener('keyup', (e) => {
            this.description = document.getElementById(this.id+'d').innerHTML;
        });
        var rejectKey = (e) => {
            if (e.key == 'Backspace') return;
            if (e.key == 'Delete') return;
            if (e.key.includes("Arrow")) return;
            if (!("1234567890".includes(e.key))){
                e.preventDefault();
            }
        };
        document.getElementById(this.id+'c').addEventListener('keydown', rejectKey);
        document.getElementById(this.id+'g').addEventListener('keydown', rejectKey);
        document.getElementById(this.id+'c').addEventListener('keyup', (e) => {
            this.current = document.getElementById(this.id+'c').innerHTML;
        });
        document.getElementById(this.id+'c').addEventListener('focusout', (e) => {
            if (parseInt(this.current) >= parseInt(this.goal)){
                celebrate();
                document.getElementById(this.id).style.backgroundColor = "#03fc62";
                this.complete = true;
            }else{
                document.getElementById(this.id).style.backgroundColor = "#fff";
                this.complete = false;
            }
        });
        if (parseInt(this.current) >= parseInt(this.goal)){
            document.getElementById(this.id).style.backgroundColor = "#03fc62";
            this.complete = true;
        }else{
            document.getElementById(this.id).style.backgroundColor = "#fff";
            this.complete = false;
        }
        document.getElementById(this.id+'g').addEventListener('keyup', (e) => {
            this.goal = document.getElementById(this.id+'g').innerHTML;
        });
    }

    deleteHTML(){
        this.html.remove();
        this.parent.deleteTask(this.id);
    }

    settingsRefresh(){
        var settings = this;
        delete settings["parent"];
        return settings;
    }
}

class Plan extends HTMLElement{
    constructor(settings = {}){
        super();
        this.name = "Default Plan";
        this.settings = settings;
        this.tasks = [];
        this.html = document.createElement('div');
        this.id = '';
        for (var x of Object.keys(settings)) {
            if (x == 'html') continue;
            this[x] = settings[x];
        }
        for (var i = 0; i < 100; i++) this.id += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)];
    }

    init(){
        hideAll();
        this.showButton = document.createElement("button");
        this.showButton.id = this.id + "display";
        this.showButton.innerHTML = this.name;
        var id = this.id;
        document.getElementById("list").append(this.showButton);
        this.showButton.addEventListener('click', (e) => {
            hideAll();
            for (var x of currentPlans){
                if (id == (x.id)){
                    x.showHTML();
                }
            }
        });
        document.getElementById("display-panel").appendChild(this.html);
        this.html.outerHTML = `<div class="plan" id="${this.id}">
            <div class="plan-title" contenteditable=true>${this.name}</div>
            <button class="new-plan-task" id="${this.id}b">New Task</button>
            <button id="${this.id}delete">Delete</button>
            <div class="tasks" id="${this.id}t">
            </div>
        </div>`;
        this.html = document.getElementById(this.id);
        this.delete = document.getElementById(this.id + "delete");
        var id = this.id;
        var ht = this.html;
        this.delete.addEventListener('click', (e) => {
            document.getElementById(id+'display').remove();
            ht.remove();
            currentPlans.forEach((T, index) => {
                if (id == T.id){
                    currentPlans.splice(index, 1);
                }
            });
            SaveAll();
        });
        this.taskList = document.getElementById(this.id + "t");
        document.getElementById(this.id + "b").addEventListener("click", () => {this.launchTaskCreation();});
    }

    deleteTask(id){
        this.tasks.forEach((T, index) => {
            if (T.id == id){
                this.tasks.splice(index, 1);
            }
        });
    }

    createTask(taskSettings){
        taskSettings.parent = this;
        this.tasks.push(new Task(taskSettings));
        this.tasks[this.tasks.length-1].init();
    }
    
    launchTaskCreation(){
        var taskname = prompt("Name of the task?", "Default Task");
        var taskdescription = prompt("Description of the task?", "(none)");
        var taskgoal = prompt("What is your end goal (should be quantifiable)?", "10");
        this.createTask({name: taskname, description: taskdescription, goal: taskgoal});
    }

    hideHTML(){
        this.html.style.display = "none";
    }

    showHTML(){
        this.html.style.display = "block";
    }

    settingsRefresh(){
        var settings = this;
        settings.tasks.forEach((T, index) => {
            settings.tasks[index] = T.settingsRefresh();
        });
        return (settings);
    }

    load(){
        this.tasks.forEach((T, index) => {
            T.parent = this;
            this.tasks[index] = new Task(T);
            this.tasks[index].init();
        });
    }
}

class Step extends Task{
    constructor (settings){
        super(settings);
        this.date = "";
    }

    init(){
        this.html = document.createElement("div");
        this.parent.taskList.appendChild(this.html);
        this.html.outerHTML = `<div class="task" id="${this.id}">
            <div class="task-information">
                <div class="task-name" id="${this.id}n" contenteditable=true>${this.name}</div>
                <div class="task-description" id="${this.id}d" contenteditable=true>${this.description}</div>
                <input type="date" id="${this.id}d">
            </div>
            <div class="task-buttons">
                <button class="task-complete" id="${this.id}do"><span class="material-symbols-outlined">
                        done
                    </span></button>
                <button class="task-remove" id="${this.id}r"><span class="material-symbols-outlined">
                    delete
                </span></button>
            </div>
        </div>`;
        this.html = document.getElementById(this.id);
        this.remove = document.getElementById(this.id + "r");
        this.buttoncomplete = document.getElementById(this.id + "do");
        this.remove.addEventListener("click", (e) => {
            this.deleteHTML();
        });
        document.getElementById(this.id+'n').addEventListener('keyup', (e) => {
            this.name = document.getElementById(this.id+'n').innerHTML;
        });
        document.getElementById(this.id+'d').addEventListener('keyup', (e) => {
            this.description = document.getElementById(this.id+'d').innerHTML;
        });
        this.buttoncomplete.addEventListener('click', (e) => {
            this.complete = !this.complete;
            document.getElementById(this.id).style.backgroundColor = this.complete ? "#03fc62" : "#fff";
            if (this.complete) celebrate();
        });
    }
}

class Deadline extends HTMLElement{
    constructor(settings = {}){
        super();
        this.name = "Default Deadline";
        this.settings = settings;
        this.tasks = [];
        this.html = document.createElement('div');
        this.id = '';
        for (var x of Object.keys(settings)) {
            if (x == 'html') continue;
            this[x] = settings[x];
        }
        for (var i = 0; i < 100; i++) this.id += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)];
    }

    init(){
        hideAll();
        var button = document.createElement("button");
        button.id = this.id + "display";
        button.innerHTML = this.name;
        document.getElementById("list").append(button);
        button.addEventListener('click', (e) => {
            hideAll();
            for (var x of currentDeadlines){
                if (e.target.id.startsWith(x.id)){
                    x.showHTML();
                }
            }
        });
        document.getElementById("display-panel").appendChild(this.html);
        this.html.outerHTML = `<div class="plan" id="${this.id}">
            <div class="plan-title" contenteditable=true>${this.name}</div>
            <button class="new-plan-step" id="${this.id}b">New Step</button>
            <button id="${this.id}delete">Delete</button>
            <div class="steps" id="${this.id}t">
            </div>
        </div>`;
        this.html = document.getElementById(this.id);
        this.delete = document.getElementById(this.id + "delete");
        var id = this.id;
        var ht = this.html;
        this.delete.addEventListener('click', (e) => {
            document.getElementById(id+'display').remove();
            ht.remove();
            currentDeadlines.forEach((T, index) => {
                if (id == T.id){
                    currentDeadlines.splice(index, 1);
                }
            });
            SaveAll();
        });
        this.taskList = document.getElementById(this.id + "t");
        document.getElementById(this.id + "b").addEventListener("click", () => {this.launchTaskCreation();});
    }


    createTask(taskSettings){
        taskSettings.parent = this;
        this.tasks.push(new Step(taskSettings));
        this.tasks[this.tasks.length-1].init();
    }

    deleteTask(id){
        this.tasks.forEach((T, index) => {
            if (T.id == id){
                this.tasks.splice(index, 1);
            }
        });
    }
    
    launchTaskCreation(){
        var taskname = prompt("Name of the step?", "Default Step");
        var taskdescription = prompt("Description of the step?", "(none)");
        this.createTask({name: taskname, description: taskdescription});
    }

    hideHTML(){
        this.html.style.display = "none";
    }

    showHTML(){
        this.html.style.display = "block";
    }

    settingsRefresh(){
        var settings = this;
        settings.tasks.forEach((T, index) => {
            settings.tasks[index] = T.settingsRefresh();
        });
        return (settings);
    }

    load(){
        this.tasks.forEach((T, index) => {
            T.parent = this;
            this.tasks[index] = new Step(T);
            this.tasks[index].init();
        });
    }
}

window.addEventListener('load', (e) => {
    LoadAll();
})
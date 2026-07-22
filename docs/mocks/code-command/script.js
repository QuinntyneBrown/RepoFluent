const screens = [...document.querySelectorAll('[data-screen]')];
const viewControls = [...document.querySelectorAll('[data-view]')];
const breadcrumbs = {
  home: ['learning', 'dashboard.rf'],
  lesson: ['foundations', 'order-workflow.md'],
  map: ['architecture', 'system-map.graph']
};

function openView(name, updateHash = true) {
  const screen = screens.find((item) => item.dataset.screen === name) || screens[0];
  screens.forEach((item) => item.classList.toggle('active', item === screen));
  viewControls.forEach((control) => {
    const active = control.dataset.view === screen.dataset.screen;
    control.classList.toggle('active', active);
    if (active) control.setAttribute('aria-current', 'page');
    else control.removeAttribute('aria-current');
  });
  document.querySelector('#crumb-section').textContent = breadcrumbs[screen.dataset.screen][0];
  document.querySelector('#crumb-page').textContent = breadcrumbs[screen.dataset.screen][1];
  if (updateHash) history.replaceState(null, '', `#${screen.dataset.screen}`);
  document.querySelector('.workbench').scrollTop = 0;
}

viewControls.forEach((control) => control.addEventListener('click', () => openView(control.dataset.view)));
document.querySelectorAll('[data-go]').forEach((control) => control.addEventListener('click', () => openView(control.dataset.go)));

const codeReferences = {
  controller: {
    file: 'OrderController.cs',
    path: 'src/Order.Api/Controllers',
    note: 'Publishing after persistence ensures the workflow always has an order to retrieve.'
  },
  consumer: {
    file: 'OrderSubmittedConsumer.cs',
    path: 'src/Order.Processor/Consumers',
    note: 'The consumer can retry external work without requiring the customer to submit the order again.'
  }
};

document.querySelectorAll('[data-code]').forEach((button) => button.addEventListener('click', () => {
  const key = button.dataset.code;
  const reference = codeReferences[key];
  document.querySelectorAll('[data-code]').forEach((item) => item.classList.toggle('active', item === button));
  document.querySelectorAll('.code-block').forEach((block) => block.classList.add('hidden'));
  document.querySelector(`#code-${key}`).classList.remove('hidden');
  document.querySelector('#code-file').textContent = reference.file;
  document.querySelector('#code-path').textContent = reference.path;
  document.querySelector('#code-note').textContent = reference.note;
  showToast(`SOURCE_OPENED: ${reference.file}`);
}));

const completeButton = document.querySelector('#complete-lesson');
completeButton.addEventListener('click', () => {
  const completed = completeButton.dataset.completed === 'true';
  completeButton.dataset.completed = String(!completed);
  completeButton.innerHTML = completed ? 'MARK COMPLETE <kbd>⌘↵</kbd>' : '✓ COMPLETED <kbd>⌘↵</kbd>';
  document.querySelector('#lesson-status').textContent = completed ? 'IN_PROGRESS' : 'COMPLETED';
  document.querySelector('#lesson-status').style.color = completed ? 'var(--amber)' : 'var(--green)';
  showToast(completed ? 'LESSON_REOPENED' : 'PROGRESS_SAVED: LESSON_04 COMPLETE');
});

const nodes = {
  storefront: { count: '01/07', kind: 'EXPERIENCE_LAYER', title: 'Storefront', description: 'Collects the customer’s cart and submits a checkout command while keeping the interaction fast and predictable.', owns: 'Checkout experience', tech: 'Angular 20', learning: '2 lessons', glyph: 'A' },
  api: { count: '02/07', kind: 'CORE_SERVICE', title: 'Order API', description: 'Accepts order commands, validates input, persists the initial record, and publishes the event that starts fulfillment.', owns: 'Order intake', tech: 'ASP.NET Core', learning: '3 lessons', glyph: 'API' },
  database: { count: '03/07', kind: 'DATA_STORE', title: 'Orders DB', description: 'Stores the durable order record and its state transitions for the API and processing workflow.', owns: 'Order state', tech: 'SQL Server', learning: '1 lesson', glyph: 'DB' },
  bus: { count: '04/07', kind: 'PLATFORM', title: 'Message bus', description: 'Carries durable domain events between the synchronous API boundary and independently retryable workers.', owns: 'Event delivery', tech: 'MassTransit', learning: '2 lessons', glyph: '↝' },
  processor: { count: '05/07', kind: 'CORE_SERVICE', title: 'Order Processor', description: 'Coordinates inventory and payment work, advances order state, and handles recoverable failures.', owns: 'Fulfillment workflow', tech: '.NET Worker', learning: '4 lessons', glyph: 'OP' },
  inventory: { count: '06/07', kind: 'EXTERNAL_SERVICE', title: 'Inventory', description: 'Reserves sellable stock for the order and reports whether every requested item can be fulfilled.', owns: 'Stock reservation', tech: 'HTTP API', learning: '1 lesson', glyph: 'IN' },
  payments: { count: '07/07', kind: 'EXTERNAL_SERVICE', title: 'Payments', description: 'Authorizes the order total after inventory has been reserved and returns a durable payment reference.', owns: 'Payment authorization', tech: 'HTTP API', learning: '1 lesson', glyph: '$' }
};

document.querySelectorAll('[data-node]').forEach((button) => button.addEventListener('click', () => {
  const node = nodes[button.dataset.node];
  document.querySelectorAll('[data-node]').forEach((item) => item.classList.toggle('selected', item === button));
  document.querySelector('#node-count').textContent = node.count;
  document.querySelector('#node-kind').textContent = node.kind;
  document.querySelector('#node-title').textContent = node.title;
  document.querySelector('#node-description').textContent = node.description;
  document.querySelector('#node-owns').textContent = node.owns;
  document.querySelector('#node-tech').textContent = node.tech;
  document.querySelector('#node-learning').textContent = node.learning;
  document.querySelector('.node-glyph').textContent = node.glyph;
}));

const dialog = document.querySelector('.command-dialog');
const commandInput = document.querySelector('#command-input');
const commandButtons = [...document.querySelectorAll('[data-command-go]')];

function openCommands() {
  dialog.hidden = false;
  commandInput.value = '';
  commandButtons.forEach((button) => { button.hidden = false; });
  setTimeout(() => commandInput.focus(), 0);
}

function closeCommands() {
  if (dialog.hidden) return;
  dialog.hidden = true;
  document.querySelector('.command-trigger').focus();
}

document.querySelector('.command-trigger').addEventListener('click', openCommands);
document.querySelector('.dialog-backdrop').addEventListener('click', closeCommands);
commandButtons.forEach((button) => button.addEventListener('click', () => {
  closeCommands();
  openView(button.dataset.commandGo);
}));
commandInput.addEventListener('input', () => {
  const query = commandInput.value.trim().toLowerCase();
  commandButtons.forEach((button) => { button.hidden = !button.textContent.toLowerCase().includes(query); });
});
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommands();
  }
  if (event.key === 'Escape') closeCommands();
});

const definitions = {
  'Order API': 'GLOSSARY · HTTP-facing service that validates order commands before asynchronous processing.',
  'Order Processor': 'GLOSSARY · Background worker that coordinates inventory, payment, and state changes.'
};
document.querySelectorAll('[data-term]').forEach((button) => button.addEventListener('click', () => showToast(definitions[button.dataset.term])));

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('.toast');
  clearTimeout(toastTimer);
  toast.textContent = `✓ ${message}`;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

const initial = location.hash.slice(1);
openView(['home', 'lesson', 'map'].includes(initial) ? initial : 'home', false);

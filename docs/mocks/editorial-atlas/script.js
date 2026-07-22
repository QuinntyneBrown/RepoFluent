const views = [...document.querySelectorAll('[data-screen]')];
const navigation = [...document.querySelectorAll('[data-view]')];
const mobileMenu = document.querySelector('.mobile-menu');
const primaryNav = document.querySelector('.primary-nav');
const codePanel = document.querySelector('.code-panel');

function showView(name, updateHash = true) {
  const next = views.find((view) => view.dataset.screen === name) || views[0];
  views.forEach((view) => view.classList.toggle('active', view === next));
  navigation.forEach((button) => {
    const active = button.dataset.view === next.dataset.screen;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  primaryNav.classList.remove('open');
  mobileMenu.setAttribute('aria-expanded', 'false');
  if (updateHash) history.replaceState(null, '', `#${next.dataset.screen}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navigation.forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => {
  closeGlossary();
  showView(button.dataset.go);
}));

mobileMenu.addEventListener('click', () => {
  const expanded = mobileMenu.getAttribute('aria-expanded') === 'true';
  mobileMenu.setAttribute('aria-expanded', String(!expanded));
  primaryNav.classList.toggle('open', !expanded);
});

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
  document.querySelector('.code-note p').textContent = reference.note;
  codePanel.classList.remove('closed');
}));

document.querySelector('.close-code').addEventListener('click', () => codePanel.classList.add('closed'));

const completeButton = document.querySelector('#complete-lesson');
completeButton.addEventListener('click', () => {
  const complete = completeButton.classList.toggle('completed');
  completeButton.innerHTML = complete
    ? '<span aria-hidden="true">✓</span> Lesson complete'
    : '<span aria-hidden="true">○</span> Mark complete';
  document.querySelector('.save-state').innerHTML = complete
    ? '<span aria-hidden="true">✓</span> Lesson completed'
    : '<span aria-hidden="true">✓</span> Progress saved';
});

const nodes = {
  storefront: { count: '01 / 07', kind: 'Experience layer', title: 'Storefront', description: 'Collects the customer’s cart and submits a checkout command while keeping the interaction fast and predictable.', owns: 'Checkout experience', tech: 'Angular 20', learning: '2 lessons' },
  api: { count: '02 / 07', kind: 'Core service', title: 'Order API', description: 'Accepts order commands, validates input, persists the initial record, and publishes the event that starts fulfillment.', owns: 'Order intake', tech: 'ASP.NET Core', learning: '3 lessons' },
  database: { count: '03 / 07', kind: 'Data store', title: 'Orders DB', description: 'Stores the durable order record and its state transitions for the API and processing workflow.', owns: 'Order state', tech: 'SQL Server', learning: '1 lesson' },
  bus: { count: '04 / 07', kind: 'Platform', title: 'Message bus', description: 'Carries durable domain events between the synchronous API boundary and independently retryable workers.', owns: 'Event delivery', tech: 'MassTransit', learning: '2 lessons' },
  processor: { count: '05 / 07', kind: 'Core service', title: 'Order Processor', description: 'Coordinates inventory and payment work, advances order state, and handles recoverable failures.', owns: 'Fulfillment workflow', tech: '.NET Worker', learning: '4 lessons' },
  inventory: { count: '06 / 07', kind: 'External service', title: 'Inventory', description: 'Reserves sellable stock for the order and reports whether every requested item can be fulfilled.', owns: 'Stock reservation', tech: 'HTTP API', learning: '1 lesson' },
  payments: { count: '07 / 07', kind: 'External service', title: 'Payments', description: 'Authorizes the order total after inventory has been reserved and returns a durable payment reference.', owns: 'Payment authorization', tech: 'HTTP API', learning: '1 lesson' }
};

document.querySelectorAll('[data-node]').forEach((button) => button.addEventListener('click', () => {
  const node = nodes[button.dataset.node];
  document.querySelectorAll('[data-node]').forEach((item) => item.classList.toggle('selected', item === button));
  document.querySelector('.detail-count').textContent = node.count;
  document.querySelector('#node-kind').textContent = node.kind;
  document.querySelector('#node-title').textContent = node.title;
  document.querySelector('#node-description').textContent = node.description;
  document.querySelector('#node-owns').textContent = node.owns;
  document.querySelector('#node-tech').textContent = node.tech;
  document.querySelector('#node-learning').textContent = node.learning;
}));

const glossary = document.querySelector('.glossary');
const glossaryTitle = document.querySelector('#glossary-title');
const glossaryText = document.querySelector('#glossary-text');
let glossaryTrigger;
const terms = {
  'Order API': 'The HTTP-facing service that accepts and validates order commands before handing work to the asynchronous pipeline.',
  'Order Processor': 'A background .NET worker that reacts to order events and coordinates inventory, payment, and order-state changes.'
};

document.querySelectorAll('[data-term]').forEach((button) => button.addEventListener('click', () => {
  glossaryTrigger = button;
  glossaryTitle.textContent = button.dataset.term;
  glossaryText.textContent = terms[button.dataset.term];
  glossary.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelector('.glossary-close').focus();
}));

function closeGlossary() {
  if (glossary.hidden) return;
  glossary.hidden = true;
  document.body.style.overflow = '';
  glossaryTrigger?.focus();
}

document.querySelector('.glossary-close').addEventListener('click', closeGlossary);
document.querySelector('.glossary-backdrop').addEventListener('click', closeGlossary);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeGlossary();
});

const initialView = location.hash.slice(1);
showView(['home', 'lesson', 'map'].includes(initialView) ? initialView : 'home', false);

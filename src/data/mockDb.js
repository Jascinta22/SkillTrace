export const challenges = [];

export const hrCandidates = [
    {
        id: "u1",
        name: "Rahul Nair",
        scores: {
            technical: { coding: 82, debugging: 74 },
            softSkills: { decisionMaking: 79, communication: 85 }
        },
        integrity: {
            tabSwitches: 3,
            pasteEvents: 2,
        },
        overallIndex: 78
    },
    {
        id: "u2",
        name: "Sarah Jenkins",
        scores: {
            technical: { coding: 95, debugging: 88 },
            softSkills: { decisionMaking: 90, communication: 92 }
        },
        integrity: {
            tabSwitches: 0,
            pasteEvents: 0,
        },
    }
];

export const questions = [
    // Python (Skill 1) - Beginner
    { id: 'q1', skillId: 1, difficulty: 'Beginner', text: 'What is a list comprehension in Python?', options: ['A loop inside brackets to create lists', 'A method to compress lists', 'A module for data structure', 'A type of variable'], correctOption: 0 },
    { id: 'q2', skillId: 1, difficulty: 'Beginner', text: 'Which keyword is used to define a function in Python?', options: ['func', 'define', 'def', 'function'], correctOption: 2 },
    { id: 'q3', skillId: 1, difficulty: 'Beginner', text: 'What is the default return value of a Python function that does not return anything?', options: ['False', 'None', '0', 'undefined'], correctOption: 1 },
    { id: 'q4', skillId: 1, difficulty: 'Beginner', text: 'Which of the following is immutable in Python?', options: ['List', 'Dictionary', 'Set', 'Tuple'], correctOption: 3 },
    { id: 'q5', skillId: 1, difficulty: 'Beginner', text: 'How do you insert an element at the end of a list?', options: ['insert()', 'append()', 'add()', 'push()'], correctOption: 1 },
    { id: 'q6', skillId: 1, difficulty: 'Beginner', text: 'What function is used to get the length of a string in Python?', options: ['size()', 'length()', 'len()', 'count()'], correctOption: 2 },
    { id: 'q7', skillId: 1, difficulty: 'Beginner', text: 'Which symbol is used for single-line comments in Python?', options: ['//', '/*', '#', '--'], correctOption: 2 },
    { id: 'q8', skillId: 1, difficulty: 'Beginner', text: 'What is the output of 3 * 1 ** 3?', options: ['27', '9', '3', '1'], correctOption: 2 },
    { id: 'q9', skillId: 1, difficulty: 'Beginner', text: 'How do you create a variable with the numeric value 5?', options: ['x = int(5)', 'int x = 5', 'x = 5', 'Both x = 5 and x = int(5)'], correctOption: 3 },
    { id: 'q10', skillId: 1, difficulty: 'Beginner', text: 'What is the correct file extension for Python files?', options: ['.pyth', '.pt', '.pyt', '.py'], correctOption: 3 },

    // Python (Skill 1) - Intermediate
    { id: 'q11', skillId: 1, difficulty: 'Intermediate', text: 'What is a Python decorator?', options: ['A syntax for designing classes', 'A function that takes another function and extends its behavior', 'A built-in GUI library', 'A tool to format strings'], correctOption: 1 },
    { id: 'q12', skillId: 1, difficulty: 'Intermediate', text: 'What does the `yield` keyword do?', options: ['Exits a function entirely', 'Returns a value and pauses the function state (Generator)', 'Passes execution to another thread', 'Throws an exception'], correctOption: 1 },
    { id: 'q13', skillId: 1, difficulty: 'Intermediate', text: 'What is the purpose of the `__init__` method in a class?', options: ['To destroy the object', 'To initialize the object attributes', 'To static load variables', 'To inherit from a parent class'], correctOption: 1 },
    { id: 'q14', skillId: 1, difficulty: 'Intermediate', text: 'Which exception is raised when a dictionary key is not found?', options: ['ValueError', 'KeyError', 'IndexError', 'MissingKeyError'], correctOption: 1 },
    { id: 'q15', skillId: 1, difficulty: 'Intermediate', text: 'What does `*args` mean in a function signature?', options: ['It passes a dictionary of arguments', 'It multiplies the arguments', 'It passes a variable number of positional arguments', 'It throws an error'], correctOption: 2 },
    { id: 'q16', skillId: 1, difficulty: 'Intermediate', text: 'What is a lambda function?', options: ['A large complex function', 'An anonymous single-expression function', 'A function that runs asynchronously', 'A database query function'], correctOption: 1 },
    { id: 'q17', skillId: 1, difficulty: 'Intermediate', text: 'What is the Global Interpreter Lock (GIL)?', options: ['A security feature', 'A mutex that prevents multiple native threads from executing Python bytecodes at once', 'A memory management tool', 'A package installer lock'], correctOption: 1 },
    { id: 'q18', skillId: 1, difficulty: 'Intermediate', text: 'How do you create a virtual environment in Python 3?', options: ['python -m venv env', 'pip venv new', 'create-env python', 'npm init python'], correctOption: 0 },
    { id: 'q19', skillId: 1, difficulty: 'Intermediate', text: 'What does PEP 8 refer to?', options: ['Python Extension Package', 'Python Enhancement Proposal (Style Guide)', 'Python Engine Protocol', 'A web framework'], correctOption: 1 },
    { id: 'q20', skillId: 1, difficulty: 'Intermediate', text: 'What does `map()` do?', options: ['Creates a dictionary', 'Applies a function to all items in an input list', 'Finds a location on a grid', 'Filters a list'], correctOption: 1 },

    // Python (Skill 1) - Advanced
    { id: 'q21', skillId: 1, difficulty: 'Advanced', text: 'What is metaclass programming in Python?', options: ['Programming with multiple classes', 'The class of a class, defining how a class behaves', 'A graphical interface tool', 'Learning multiple languages'], correctOption: 1 },
    { id: 'q22', skillId: 1, difficulty: 'Advanced', text: 'How is memory managed in Python?', options: ['Manual allocation natively', 'Garbage collection via reference counting', 'No memory management', 'Stack-only allocation'], correctOption: 1 },
    { id: 'q23', skillId: 1, difficulty: 'Advanced', text: 'What is the difference between `__new__` and `__init__`?', options: ['No difference', '`__new__` creates the instance, `__init__` initializes it', '`__new__` is for variables, `__init__` is for functions', '`__new__` is deprecated'], correctOption: 1 },
    { id: 'q24', skillId: 1, difficulty: 'Advanced', text: 'What are Python descriptor classes?', options: ['Classes that describe strings', 'Classes with __get__, __set__, and __delete__ methods to manage attribute access', 'A way to write SQL schemas', 'A plotting library'], correctOption: 1 },
    { id: 'q25', skillId: 1, difficulty: 'Advanced', text: 'What is duck typing?', options: ['A typo detection algorithm', 'Type checking based on object behavior/methods rather than explicit inheritance', 'A networking protocol', 'A file format'], correctOption: 1 },
    { id: 'q26', skillId: 1, difficulty: 'Advanced', text: 'How does `asyncio` achieve concurrency?', options: ['Using multiple CPU cores', 'Using multithreading natively', 'Using an event loop running in a single thread', 'Using sub-processes'], correctOption: 2 },
    { id: 'q27', skillId: 1, difficulty: 'Advanced', text: 'What is monkey patching?', options: ['A code smell', 'Dynamically changing a class or module at runtime', 'Testing monkeys', 'A security vulnerability'], correctOption: 1 },
    { id: 'q28', skillId: 1, difficulty: 'Advanced', text: 'What is the purpose of `__slots__`?', options: ['To reserve memory for variables', 'To explicitly declare data members and prevent the creation of `__dict__` to save memory', 'To create a gambling game', 'To multi-thread'], correctOption: 1 },
    { id: 'q29', skillId: 1, difficulty: 'Advanced', text: 'What is a context manager used for?', options: ['Managing remote servers', 'Resource management to setup and teardown resources cleanly (e.g., using `with` statement)', ' Managing employee data', 'Routing URL requests'], correctOption: 1 },
    { id: 'q30', skillId: 1, difficulty: 'Advanced', text: 'Explain the difference between deepcopy and shallow copy.', options: ['No difference', 'Shallow copies nested objects by reference, deepcopy creates entirely independent clones', 'Shallow copy is faster but less secure', 'Deepcopy compresses the copied object'], correctOption: 1 },

    // Data Structures (Skill 2) - Beginner
    { id: 'q31', skillId: 2, difficulty: 'Beginner', text: 'What is the time complexity of searching an element in a balanced Binary Search Tree?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], correctOption: 2 },
    { id: 'q32', skillId: 2, difficulty: 'Beginner', text: 'Which data structure works on a LIFO (Last In First Out) principle?', options: ['Queue', 'Stack', 'Linked List', 'Array'], correctOption: 1 },
    { id: 'q33', skillId: 2, difficulty: 'Beginner', text: 'What data structure is used for Breadth-First Search (BFS)?', options: ['Stack', 'Queue', 'Graph', 'Tree'], correctOption: 1 },
    { id: 'q34', skillId: 2, difficulty: 'Beginner', text: 'Which data structure allows access to elements by an index natively?', options: ['Tree', 'Array', 'Linked List', 'Queue'], correctOption: 1 },
    { id: 'q35', skillId: 2, difficulty: 'Beginner', text: 'What is a node in a Linked List?', options: ['An array', 'An object containing data and a pointer to the next node', 'A memory address', 'A network connection'], correctOption: 1 },
    { id: 'q36', skillId: 2, difficulty: 'Beginner', text: 'What tree traversal algorithm visits nodes in the order: Left, Root, Right?', options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'], correctOption: 2 },
    { id: 'q37', skillId: 2, difficulty: 'Beginner', text: 'What is a Hash Map primarily used for?', options: ['Sorting items', 'Fast lookups via Key/Value pairs', 'Connecting networks', 'Drawing graphs'], correctOption: 1 },
    { id: 'q38', skillId: 2, difficulty: 'Beginner', text: 'Which operation on an array is usually O(n) time?', options: ['Accessing by index', 'Inserting at the very end', 'Inserting at the beginning', 'Checking length'], correctOption: 2 },
    { id: 'q39', skillId: 2, difficulty: 'Beginner', text: 'What is a Queue principle?', options: ['LIFO', 'FIFO', 'Random access', 'Binary search'], correctOption: 1 },
    { id: 'q40', skillId: 2, difficulty: 'Beginner', text: 'An array of size N has valid indices ranging from:', options: ['1 to N', '0 to N', '1 to N-1', '0 to N-1'], correctOption: 3 },

    // Web Development (Skill 3) - Beginner
    { id: 'q41', skillId: 3, difficulty: 'Beginner', text: 'What does CSS stand for?', options: ['Computing Style Sheets', 'Creative Style System', 'Cascading Style Sheets', 'Computer Styling Sheets'], correctOption: 2 },
    { id: 'q42', skillId: 3, difficulty: 'Beginner', text: 'Which HTML element is used to specify a footer for a document?', options: ['<bottom>', '<footer>', '<section>', '<div>'], correctOption: 1 },
    { id: 'q43', skillId: 3, difficulty: 'Beginner', text: 'What tag is used to create a hyperlink?', options: ['<link>', '<href>', '<a>', '<nav>'], correctOption: 2 },
    { id: 'q44', skillId: 3, difficulty: 'Beginner', text: 'Which attribute in an <img> tag specifies alternative text?', options: ['title', 'alt', 'src', 'longdesc'], correctOption: 1 },
    { id: 'q45', skillId: 3, difficulty: 'Beginner', text: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HyperText Machine Language', 'Hyper Transfer Markup Language', 'High Text Markup Language'], correctOption: 0 },
    { id: 'q46', skillId: 3, difficulty: 'Beginner', text: 'In CSS, how do you select an element with id "demo"?', options: ['.demo', 'demo', '#demo', '*demo'], correctOption: 2 },
    { id: 'q47', skillId: 3, difficulty: 'Beginner', text: 'How do you create a function in JavaScript?', options: ['function = myFunction()', 'function myFunction()', 'function:myFunction()', 'create myFunction()'], correctOption: 1 },
    { id: 'q48', skillId: 3, difficulty: 'Beginner', text: 'What is the correct way to write a JavaScript array?', options: ['var colors = (1:"red", 2:"blue")', 'var colors = ["red", "blue"]', 'var colors = "red", "blue"', 'var colors = {red, blue}'], correctOption: 1 },
    { id: 'q49', skillId: 3, difficulty: 'Beginner', text: 'Which property is used to change the background color in CSS?', options: ['bgcolor', 'color-background', 'background-color', 'color'], correctOption: 2 },
    { id: 'q50', skillId: 3, difficulty: 'Beginner', text: 'What symbol signifies a class selector in CSS?', options: ['#', '.', '*', '&'], correctOption: 1 },

    // Machine Learning (Skill 4) - Intermediate
    { id: 'q51', skillId: 4, difficulty: 'Intermediate', text: 'In machine learning, what is overfitting?', options: ['Model learns the training data too well, failing to generalize', 'Model fails to learn the training data', 'Model predicts everything perfectly', 'Model requires too much computation'], correctOption: 0 },
    { id: 'q52', skillId: 4, difficulty: 'Intermediate', text: 'Which of the following is an unsupervised learning algorithm?', options: ['Linear Regression', 'Logistic Regression', 'K-Means Clustering', 'Random Forest'], correctOption: 2 },
    { id: 'q53', skillId: 4, difficulty: 'Intermediate', text: 'What is a neural network primarily inspired by?', options: ['Computer circuits', 'Biological neurons', 'Quantum mechanics', 'Statistical models'], correctOption: 1 },
    { id: 'q54', skillId: 4, difficulty: 'Intermediate', text: 'What is the goal of gradient descent?', options: ['Increase the error', 'Find the local minimum of a cost function', 'Randomize weights', 'Visualize data'], correctOption: 1 },
    { id: 'q55', skillId: 4, difficulty: 'Intermediate', text: 'What does a large learning rate cause in training?', options: ['Faster convergence safely', 'The algorithm might overshoot the minimum and diverge', 'No effect', 'Better memory usage'], correctOption: 1 },
    { id: 'q56', skillId: 4, difficulty: 'Intermediate', text: 'What is one-hot encoding used for?', options: ['Compressing images', 'Converting categorical data into binary vectors', 'Encrypting passwords', 'Translating languages'], correctOption: 1 },
    { id: 'q57', skillId: 4, difficulty: 'Intermediate', text: 'What evaluates the performance of a classification model?', options: ['MSE', 'Confusion Matrix', 'Silhouette Score', 'R-Squared'], correctOption: 1 },
    { id: 'q58', skillId: 4, difficulty: 'Intermediate', text: 'What does SVM stand for?', options: ['Super Vector Machines', 'Support Vector Machine', 'System Version Module', 'Statistical Variable Model'], correctOption: 1 },
    { id: 'q59', skillId: 4, difficulty: 'Intermediate', text: 'What is epochs in training?', options: ['A single mathematical calculation', 'One complete pass through the entire training dataset', 'The size of the data batch', 'The hardware used'], correctOption: 1 },
    { id: 'q60', skillId: 4, difficulty: 'Intermediate', text: 'Which activation function is most common in hidden layers today?', options: ['Sigmoid', 'ReLU', 'Tanh', 'Linear'], correctOption: 1 },

    // Communication (Skill 5) - Beginner
    { id: 'q61', skillId: 5, difficulty: 'Beginner', text: 'What is "active listening"?', options: ['Listening while exercising', 'Hearing but not responding', 'Fully concentrating, understanding, responding and remembering', 'Interrupting to show engagement'], correctOption: 2 },
    { id: 'q62', skillId: 5, difficulty: 'Beginner', text: 'When receiving critical feedback, the best immediate response is usually to:', options: ['Defend yourself strongly', 'Acknowledge and ask clarifying questions', 'Ignore the feedback completely', 'Blame others'], correctOption: 1 },
    { id: 'q63', skillId: 5, difficulty: 'Beginner', text: 'What is non-verbal communication?', options: ['Writing emails', 'Body language, facial expressions, and posture', 'Speaking softly', 'Using sign language only'], correctOption: 1 },
    { id: 'q64', skillId: 5, difficulty: 'Beginner', text: 'In an email, using ALL CAPS generally implies:', options: ['Professionalism', 'Shouting', 'Sadness', 'Agreement'], correctOption: 1 },
    { id: 'q65', skillId: 5, difficulty: 'Beginner', text: 'When presenting to an audience, eye contact helps to:', options: ['Intimidate them', 'Build trust and keep them engaged', 'Make them look away', 'Help you memorize the speech'], correctOption: 1 },
    { id: 'q66', skillId: 5, difficulty: 'Beginner', text: 'What is a key part of empathy in communication?', options: ['Feeling sorry for someone', 'Trying to understand proceedings from their perspective', 'Agreeing with everything they say', 'Offering immediate solutions'], correctOption: 1 },
    { id: 'q67', skillId: 5, difficulty: 'Beginner', text: 'Before hitting "Send" on a sensitive email, you should:', options: ['Send it quickly', 'Re-read it to ensure the tone is appropriate', 'CC the entire company', 'Delete it'], correctOption: 1 },
    { id: 'q68', skillId: 5, difficulty: 'Beginner', text: 'The "sandwich" method of feedback involves:', options: ['Eating lunch during meetings', 'Positive comment, constructive criticism, positive comment', 'Being very blunt', 'Avoiding the main issue'], correctOption: 1 },
    { id: 'q69', skillId: 5, difficulty: 'Beginner', text: 'Which is an open-ended question?', options: ['Did you finish the task?', 'Is this correct?', 'How did you approach this problem?', 'Do you agree?'], correctOption: 2 },
    { id: 'q70', skillId: 5, difficulty: 'Beginner', text: 'Which channel is best for delivering unfortunate news?', options: ['Slack message', 'Email', 'Face-to-face or video call', 'Carrier pigeon'], correctOption: 2 },

    // Decision Making (Skill 6) - Advanced
    { id: 'q71', skillId: 6, difficulty: 'Advanced', text: 'What is confirmation bias in decision making?', options: ['Making sure everyone agrees', 'Confirming data with three sources', 'Seeking information that confirms preconceptions', 'Decision based strictly on metrics'], correctOption: 2 },
    { id: 'q72', skillId: 6, difficulty: 'Advanced', text: 'What is an opportunity cost?', options: ['The financial cost of a decision', 'The value of the next best alternative forgone', 'Cost of creating a new opportunity', 'Hidden fees'], correctOption: 1 },
    { id: 'q73', skillId: 6, difficulty: 'Advanced', text: 'What is the "Sunk Cost Fallacy"?', options: ['Investing more in a failing project because you already invested heavily in it', 'Sinking costs into a new database', 'Reducing costs dynamically', 'A tax strategy'], correctOption: 0 },
    { id: 'q74', skillId: 6, difficulty: 'Advanced', text: 'In crisis decision making, what is the OODA loop?', options: ['Observe, Orient, Decide, Act', 'Organize, Outsource, Delegate, Achieve', 'Only Open Doors Afterwards', 'Obtain, Optimize, Deploy, Automate'], correctOption: 0 },
    { id: 'q75', skillId: 6, difficulty: 'Advanced', text: 'What is "groupthink"?', options: ['A positive brainstorming session', 'When the desire for harmony results in an irrational or dysfunctional decision', 'A team building exercise', 'Democractic voting'], correctOption: 1 },
    { id: 'q76', skillId: 6, difficulty: 'Advanced', text: 'What characterizes a "First Principles" thinking approach?', options: ['Doing what competitors do', 'Breaking a problem down to its fundamental, undeniable truths and building up from there', 'Following the first idea you get', 'Listening to the CEO'], correctOption: 1 },
    { id: 'q77', skillId: 6, difficulty: 'Advanced', text: 'What is the Pareto Principle (80/20 rule)?', options: ['80% of efforts lead to 20% of outcomes', '80% of consequences come from 20% of causes', 'You should work 80 hours a week', '80% of coding is debugging'], correctOption: 1 },
    { id: 'q78', skillId: 6, difficulty: 'Advanced', text: 'What is "decision fatigue"?', options: ['Being tired of meetings', 'Deteriorating quality of decisions made by an individual after a long session of decision making', 'A psychological disorder', 'Failing to make any decision'], correctOption: 1 },
    { id: 'q79', skillId: 6, difficulty: 'Advanced', text: 'What is a SWOT analysis?', options: ['Strengths, Weaknesses, Opportunities, Threats', 'Software, Web, Operations, Tech', 'Standard Workflow Operational Testing', 'Sales, Wealth, Organization, Team'], correctOption: 0 },
    { id: 'q80', skillId: 6, difficulty: 'Advanced', text: 'What is the "Anchoring Effect"?', options: ['Tying a boat securely', 'Relying too heavily on the first piece of information offered when making decisions', 'Stabilizing a software architecture', 'A leader making all decisions'], correctOption: 1 },
];

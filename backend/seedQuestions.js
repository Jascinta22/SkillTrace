const { Client } = require('pg');
require('dotenv').config();

const questionsData = {
    "Python": {
        "Beginner": [
            { text: "What is the output of print(2**3)?", code: "", answer: "8", points: 10 },
            { text: "Which keyword is used to create a function in Python?", code: "", answer: "def", points: 10 },
            { text: "How do you start a comment in Python?", code: "", answer: "#", points: 10 },
            { text: "Which data type is used to store multiple items in a single variable?", code: "", answer: "list", points: 10 },
            { text: "What is the correct file extension for Python files?", code: "", answer: ".py", points: 10 },
            { text: "How do you create a variable with the numeric value 5?", code: "", answer: "x = 5", points: 10 },
            { text: "What is a correct syntax to output 'Hello World' in Python?", code: "", answer: "print('Hello World')", points: 10 },
            { text: "Which operator is used to multiply numbers?", code: "", answer: "*", points: 10 },
            { text: "Which operator can be used to compare two values?", code: "", answer: "==", points: 10 },
            { text: "Which method can be used to remove any whitespace from both the beginning and the end of a string?", code: "", answer: "strip()", points: 10 }
        ],
        "Intermediate": [
            { text: "What is a lambda function in Python?", code: "", answer: "An anonymous one-line function", points: 20 },
            { text: "What does the 'self' keyword represent in a class method?", code: "", answer: "The instance of the object", points: 20 },
            { text: "How do you handle exceptions in Python?", code: "", answer: "try-except block", points: 20 },
            { text: "What is the difference between a list and a tuple?", code: "", answer: "List is mutable, tuple is immutable", points: 20 },
            { text: "What does the 'yield' keyword do?", code: "", answer: "Returns a generator object", points: 20 },
            { text: "What is a decorator in Python?", code: "", answer: "A function that modifies the behavior of another function", points: 20 },
            { text: "How do you import a module 'math'?", code: "", answer: "import math", points: 20 },
            { text: "What is list comprehension?", code: "", answer: "A concise way to create lists", points: 20 },
            { text: "What is the output of [x for x in range(3)]?", code: "", answer: "[0, 1, 2]", points: 20 },
            { text: "What does 'pip' stand for in Python?", code: "", answer: "Preferred Installer Program", points: 20 }
        ],
        "Advanced": [
            { text: "What are metaclasses in Python?", code: "", answer: "Classes of classes that define behavior of classes", points: 30 },
            { text: "Explain Global Interpreter Lock (GIL).", code: "", answer: "A mutex that allows only one thread to execute Python bytecode at a time", points: 30 },
            { text: "What is the difference between __str__ and __repr__?", code: "", answer: "__str__ is for users, __repr__ is for developers/debugging", points: 30 },
            { text: "How does memory management work in Python?", code: "", answer: "Private heap space with garbage collection (reference counting)", points: 30 },
            { text: "Explain the concept of MRO (Method Resolution Order).", code: "", answer: "The order in which Python looks for a method in a hierarchy of classes", points: 30 },
            { text: "What are descriptors in Python?", code: "", answer: "Objects that define __get__, __set__, or __delete__ methods", points: 30 },
            { text: "What is the purpose of the 'asyncio' library?", code: "", answer: "Writing single-threaded concurrent code using coroutines", points: 30 },
            { text: "Explain the difference between deep copy and shallow copy.", code: "", answer: "Shallow copy copies references, deep copy copies objects recursively", points: 30 },
            { text: "What is the use of the __slots__ attribute?", code: "", answer: "To explicitly declare data members and save memory", points: 30 },
            { text: "How do you profile a Python script?", code: "", answer: "Using cProfile or profile modules", points: 30 }
        ]
    },
    "Data Structures": {
        "Beginner": [
            { text: "What is an array?", code: "", answer: "A collection of elements stored at contiguous memory locations", points: 10 },
            { text: "What is a stack?", code: "", answer: "A LIFO (Last In First Out) data structure", points: 10 },
            { text: "What is a queue?", code: "", answer: "A FIFO (First In First Out) data structure", points: 10 },
            { text: "What is a linked list?", code: "", answer: "A linear data structure where elements are not stored in contiguous locations", points: 10 },
            { text: "What is the time complexity of accessing an element in an array by index?", code: "", answer: "O(1)", points: 10 },
            { text: "Which data structure is used for BFS (Breadth-First Search)?", code: "", answer: "Queue", points: 10 },
            { text: "Which data structure is used for DFS (Depth-First Search)?", code: "", answer: "Stack / Recursion", points: 10 },
            { text: "What is a binary tree?", code: "", answer: "A tree structure where each node has at most two children", points: 10 },
            { text: "What is a hash table?", code: "", answer: "A data structure that maps keys to values using a hash function", points: 10 },
            { text: "What is the root in a tree?", code: "", answer: "The top node with no parent", points: 10 }
        ],
        "Intermediate": [
            { text: "What is the time complexity of searching in a Balanced Binary Search Tree?", code: "", answer: "O(log n)", points: 20 },
            { text: "Difference between a Graph and a Tree?", code: "", answer: "Tree is a connected graph without cycles", points: 20 },
            { text: "What is a Max-Heap?", code: "", answer: "A complete binary tree where the root is greater than its children", points: 20 },
            { text: "How do you detect a cycle in a linked list?", code: "", answer: "Floyd's Cycle-Finding Algorithm (Tortoise and Hare)", points: 20 },
            { text: "What is a Trie (Prefix Tree)?", code: "", answer: "An ordered tree used to store a dynamic set or associative array where keys are strings", points: 20 },
            { text: "What is a Priority Queue?", code: "", answer: "A queue where elements have associated priorities", points: 20 },
            { text: "What is the time complexity of merging two sorted lists?", code: "", answer: "O(n+m)", points: 20 },
            { text: "Explain In-order traversal of a BST.", code: "", answer: "Left -> Root -> Right (produces sorted order)", points: 20 },
            { text: "What is auxiliary space in algorithms?", code: "", answer: "The extra space used by an algorithm apart from input data", points: 20 },
            { text: "What is a circular linked list?", code: "", answer: "A linked list where the last node points back to the first node", points: 20 }
        ],
        "Advanced": [
            { text: "What is an AVL Tree?", code: "", answer: "A self-balancing binary search tree", points: 30 },
            { text: "Explain the working of Dijkstra's Algorithm.", code: "", answer: "Finds the shortest path from a source to all other nodes in a weighted graph", points: 30 },
            { text: "What is a Red-Black Tree?", code: "", answer: "A self-balancing BST with properties that ensure logarithmic height", points: 30 },
            { text: "How does a B-Tree differ from a Binary Tree?", code: "", answer: "B-Tree can have more than two children and multiple keys per node", points: 30 },
            { text: "What is a Segment Tree?", code: "", answer: "Used for storing information about intervals or segments", points: 30 },
            { text: "Explain the concept of Dynamic Programming.", code: "", answer: "Solving complex problems by breaking them down into simpler subproblems", points: 30 },
            { text: "What is the amortized time complexity of a dynamic array resize?", code: "", answer: "O(1)", points: 30 },
            { text: "What is a Bloom Filter?", code: "", answer: "A space-efficient probabilistic data structure used to test set membership", points: 30 },
            { text: "Explain the A* Search algorithm.", code: "", answer: "Graph traversal and path search algorithm using heuristics", points: 30 },
            { text: "What is a Skip List?", code: "", answer: "A probabilistic data structure that allows fast search within an ordered sequence of elements", points: 30 }
        ]
    },
    "Web Development": {
        "Beginner": [
            { text: "What does HTML stand for?", code: "", answer: "HyperText Markup Language", points: 10 },
            { text: "What does CSS stand for?", code: "", answer: "Cascading Style Sheets", points: 10 },
            { text: "What is the purpose of the <body> tag?", code: "", answer: "Contains the visible content of the page", points: 10 },
            { text: "How do you create a hyperlink in HTML?", code: "", answer: "<a href='...'>", points: 10 },
            { text: "Which property is used to change the background color in CSS?", code: "", answer: "background-color", points: 10 },
            { text: "What is JavaScript?", code: "", answer: "A programming language used for web interactivity", points: 10 },
            { text: "What is the DOM?", code: "", answer: "Document Object Model", points: 10 },
            { text: "How do you add an external CSS file?", code: "", answer: "<link rel='stylesheet' href='...'>", points: 10 },
            { text: "Which HTML tag is used for the largest heading?", code: "", answer: "<h1>", points: 10 },
            { text: "What is an ID selector in CSS?", code: "", answer: "#id-name", points: 10 }
        ],
        "Intermediate": [
            { text: "What is the difference between '==' and '===' in JavaScript?", code: "", answer: "== checks value, === checks value and type", points: 20 },
            { text: "What is a CSS Flexbox?", code: "", answer: "A layout model for arranging items in a container", points: 20 },
            { text: "What is an API?", code: "", answer: "Application Programming Interface", points: 20 },
            { text: "Explain asynchronous programming in JavaScript.", code: "", answer: "Using callbacks, promises, or async/await to handle tasks non-blockingly", points: 20 },
            { text: "What is REST?", code: "", answer: "Representational State Transfer (an architectural style for APIs)", points: 20 },
            { text: "What is a closure in JavaScript?", code: "", answer: "A function that has access to its outer scope", points: 20 },
            { text: "What is the purpose of 'localStorage'?", code: "", answer: "To store data in the browser with no expiration date", points: 20 },
            { text: "What is React?", code: "", answer: "A JavaScript library for building user interfaces", points: 20 },
            { text: "Difference between 'var', 'let', and 'const'?", code: "", answer: "var is function-scoped; let and const are block-scoped", points: 20 },
            { text: "What is the CSS Box Model?", code: "", answer: "Content, Padding, Border, and Margin", points: 20 }
        ],
        "Advanced": [
            { text: "What is Server-Side Rendering (SSR)?", code: "", answer: "Rendering pages on the server instead of the browser", points: 30 },
            { text: "Explain the Virtual DOM in React.", code: "", answer: "A lightweight representation of the real DOM used for performance optimization", points: 30 },
            { text: "What is a Web Worker?", code: "", answer: "A script that runs in the background, separate from the main execution thread", points: 30 },
            { text: "What is Cross-Site Scripting (XSS)?", code: "", answer: "A security vulnerability where attackers inject scripts into web pages", points: 30 },
            { text: "Explain the 'this' keyword in different contexts in JS.", code: "", answer: "Refers to the object that is executing the current piece of code", points: 30 },
            { text: "What is GraphQL?", code: "", answer: "A query language for APIs and a runtime for fulfilling those queries", points: 30 },
            { text: "What is Progressive Web App (PWA)?", code: "", answer: "Web applications that load like regular web pages but offer offline functionality and push notifications", points: 30 },
            { text: "How does the JS Event Loop work?", code: "", answer: "Manages the execution of multiple scripts by placing them in a queue", points: 30 },
            { text: "What are React Hooks?", code: "", answer: "Functions that let you 'hook into' React state and lifecycle features from function components", points: 30 },
            { text: "What is Content Security Policy (CSP)?", code: "", answer: "A security layer that helps detect and mitigate certain types of attacks like XSS", points: 30 }
        ]
    },
    "Machine Learning": {
        "Beginner": [
            { text: "What is Supervised Learning?", code: "", answer: "Learning from a labeled dataset", points: 10 },
            { text: "What is Unsupervised Learning?", code: "", answer: "Learning patterns from unlabeled data", points: 10 },
            { text: "What is a Linear Regression?", code: "", answer: "Predicting a continuous value based on input features", points: 10 },
            { text: "What is a Feature in ML?", code: "", answer: "An individual measurable property of a phenomenon being observed", points: 10 },
            { text: "What is Overfitting?", code: "", answer: "When a model learns the training data too well, including noise", points: 10 },
            { text: "What is a Neural Network?", code: "", answer: "A series of algorithms that endeavor to recognize underlying relationships in a set of data", points: 10 },
            { text: "What is the training set?", code: "", answer: "A subset to train the model", points: 10 },
            { text: "What is classification?", code: "", answer: "Predicting a discrete label or category", points: 10 },
            { text: "What is a Decision Tree?", code: "", answer: "A flowchart-like structure used for classification and regression", points: 10 },
            { text: "What is the target variable?", code: "", answer: "The output variable we want to predict", points: 10 }
        ],
        "Intermediate": [
            { text: "What is Gradient Descent?", code: "", answer: "An optimization algorithm used to minimize a function", points: 20 },
            { text: "Explain Underfitting.", code: "", answer: "When a model cannot capture the underlying trend of the data", points: 20 },
            { text: "What is K-Means Clustering?", code: "", answer: "An iterative algorithm that partitions data into K groups", points: 20 },
            { text: "What is Cross-Validation?", code: "", answer: "A technique to evaluate a model's performance on unseen data", points: 20 },
            { text: "What is Random Forest?", code: "", answer: "An ensemble learning method that uses multiple decision trees", points: 20 },
            { text: "What is the purpose of an Activation Function?", code: "", answer: "Introduces non-linearity into the network", points: 20 },
            { text: "What is Precision and Recall?", code: "", answer: "Metrics used to evaluate classification performance", points: 20 },
            { text: "What is Regularization (L1/L2)?", code: "", answer: "Techniques used to prevent overfitting by penalizing complexity", points: 20 },
            { text: "What is a Support Vector Machine (SVM)?", code: "", answer: "Finds the hyperplane that best separates different classes", points: 20 },
            { text: "What is the F1 Score?", code: "", answer: "The harmonic mean of precision and recall", points: 20 }
        ],
        "Advanced": [
            { text: "Explain Backpropagation.", code: "", answer: "The process of calculating gradients in a neural network", points: 30 },
            { text: "What is a Convolutional Neural Network (CNN)?", code: "", answer: "Specialized for processing structured arrays of data such as images", points: 30 },
            { text: "What is a Recurrent Neural Network (RNN)?", code: "", answer: "Designed for sequential data like time series or natural language", points: 30 },
            { text: "What is Transfer Learning?", code: "", answer: "Using a pre-trained model on a new but related problem", points: 30 },
            { text: "What is Reinforcement Learning?", code: "", answer: "Learning by interacting with an environment to maximize rewards", points: 30 },
            { text: "What are Transformers in ML?", code: "", answer: "Architecture that uses self-attention mechanisms to process sequences", points: 30 },
            { text: "Explain the curse of dimensionality.", code: "", answer: "Problems that arise when analyzing data in high-dimensional spaces", points: 30 },
            { text: "What is Gradient Boosting?", code: "", answer: "An ensemble technique that builds models sequentially, each correcting the previous one's errors", points: 30 },
            { text: "What is Generative Adversarial Network (GAN)?", code: "", answer: "Consists of two networks, a generator and a discriminator, that compete", points: 30 },
            { text: "What is hyperparameter tuning?", code: "", answer: "The process of finding the optimal set of hyperparameters for an ML algorithm", points: 30 }
        ]
    },
    "Communication Skills": {
        "Beginner": [
            { text: "What is active listening?", code: "", answer: "Fully concentrating on what is being said rather than just passively hearing", points: 10 },
            { text: "What constitutes non-verbal communication?", code: "", answer: "Body language, facial expressions, and gestures", points: 10 },
            { text: "How do you give constructive feedback?", code: "", answer: "Be specific, objective, and focus on behavior rather than personality", points: 10 },
            { text: "What is the importance of eye contact?", code: "", answer: "Shows confidence, sincerity, and interest", points: 10 },
            { text: "How should you introduce yourself in a professional setting?", code: "", answer: "State your name, role, and a brief overview of your background", points: 10 },
            { text: "What is empathy in communication?", code: "", answer: "Understanding and sharing the feelings of others", points: 10 },
            { text: "What is a clear way to end a professional email?", code: "", answer: "With a sincere closing like 'Best regards' or 'Sincerely'", points: 10 },
            { text: "How do you handle a misunderstanding?", code: "", answer: "Clarify points patiently and check for common ground", points: 10 },
            { text: "What is a common barrier to communication?", code: "", answer: "Jargon, emotional noise, or physical distractions", points: 10 },
            { text: "Why is proofreading important?", code: "", answer: "To ensure clarity and maintain professional credibility", points: 10 }
        ],
        "Intermediate": [
            { text: "How do you lead a successful meeting?", code: "", answer: "Have a clear agenda and keep the discussion focused", points: 20 },
            { text: "What is the 'elevator pitch'?", code: "", answer: "A concise summary of yourself or an idea (30-60 seconds)", points: 20 },
            { text: "How do you communicate effectively under pressure?", code: "", answer: "Stay calm, be concise, and focus on the most critical information", points: 20 },
            { text: "Explain the importance of 'tone' in written communication.", code: "", answer: "Affects how the message is interpreted and perceived by the reader", points: 20 },
            { text: "How do you negotiate a win-win outcome?", code: "", answer: "Understand interests of both parties and look for mutual gains", points: 20 },
            { text: "What is the difference between assertive and aggressive communication?", code: "", answer: "Assertiveness is clear and respectful; aggression is forceful and disrespectful", points: 20 },
            { text: "How do you handle difficult conversations?", code: "", answer: "Prepare, stay objective, and focus on solutions", points: 20 },
            { text: "What is the role of cultural awareness in communication?", code: "", answer: "Helps avoid misunderstandings and builds respect across diverse groups", points: 20 },
            { text: "How do you tailor a message for a specific audience?", code: "", answer: "Use relevant examples, appropriate language, and address their needs", points: 20 },
            { text: "What is persuasive communication?", code: "", answer: "Using logic, credibility, and emotion to influence others", points: 20 }
        ],
        "Advanced": [
            { text: "How do you communicate complex technical ideas to non-technical stakeholders?", code: "", answer: "Use analogies, avoid jargon, and focus on the 'why' (business value)", points: 30 },
            { text: "What is crisis communication management?", code: "", answer: "The strategic management of information during a high-stakes emergency", points: 30 },
            { text: "How do you build executive presence through communication?", code: "", answer: "Project confidence, be decisive, and master the art of storytelling", points: 30 },
            { text: "Explain the concept of 'Emotional Intelligence' (EQ) in leadership communication.", code: "", answer: "The ability to manage your own and others' emotions effectively", points: 30 },
            { text: "How do you influence without authority?", code: "", answer: "Build relationships, provide data, and show mutual benefit", points: 30 },
            { text: "Advanced conflict resolution strategies.", code: "", answer: "Mediation, finding root causes, and creating long-term behavioral agreements", points: 30 },
            { text: "What is cross-cultural leadership communication?", code: "", answer: "Adapting leadership styles and communication to different global contexts", points: 30 },
            { text: "How do you master high-stakes public speaking?", code: "", answer: "Extensive preparation, connecting with the audience, and managing physiological stress", points: 30 },
            { text: "What is strategic messaging?", code: "", answer: "Aligning all communications with high-level organizational goals", points: 30 },
            { text: "The art of active listening in executive coaching.", code: "", answer: "Listening for subtext, values, and limiting beliefs", points: 30 }
        ]
    },
    "Decision Making": {
        "Beginner": [
            { text: "What is the first step in a decision-making process?", code: "", answer: "Identifying the problem or goal", points: 10 },
            { text: "What is a 'pro-con' list?", code: "", answer: "A simple list of advantages and disadvantages", points: 10 },
            { text: "Why is it important to gather information before deciding?", code: "", answer: "To reduce uncertainty and make a more informed choice", points: 10 },
            { text: "What is an impulsive decision?", code: "", answer: "A choice made quickly without much thought", points: 10 },
            { text: "What is a consensus decision?", code: "", answer: "A decision that everyone in a group can support", points: 10 },
            { text: "What is the role of values in decision making?", code: "", answer: "They act as a guide for what is right or important", points: 10 },
            { text: "What is opportunity cost?", code: "", answer: "The value of the next best alternative given up", points: 10 },
            { text: "How does time pressure affect decision making?", code: "", answer: "It can lead to faster but potentially lower-quality choices", points: 10 },
            { text: "What is a binary decision?", code: "", answer: "A choice between two options (Yes/No)", points: 10 },
            { text: "Why review a decision after it's made?", code: "", answer: "To learn from the outcome and improve future decisions", points: 10 }
        ],
        "Intermediate": [
            { text: "What is the S.W.O.T. analysis?", code: "", answer: "Strengths, Weaknesses, Opportunities, Threats", points: 20 },
            { text: "Explain the 'Decision Tree' approach.", code: "", answer: "Mapping out possible paths and their associated outcomes", points: 20 },
            { text: "What is 'groupthink'?", code: "", answer: "Prioritizing harmony in a group over critical thinking", points: 20 },
            { text: "How do you manage bias in decision making?", code: "", answer: "Awareness, seeking diverse opinions, and using objective criteria", points: 20 },
            { text: "What is the Pareto Principle (80/20 rule)?", code: "", answer: "80% of results come from 20% of efforts/decisions", points: 20 },
            { text: "Explain the concept of 'Satisficing'.", code: "", answer: "Choosing the first option that meets the minimum criteria", points: 20 },
            { text: "What is an escalation of commitment?", code: "", answer: "Continuing to invest in a failing decision because of past investments (Sunk Cost Fallacy)", points: 20 },
            { text: "How do you decide when information is incomplete?", code: "", answer: "Assessing risks, probabilities, and having a backup plan", points: 20 },
            { text: "What is data-driven decision making?", code: "", answer: "Using facts and metrics to guide choices rather than intuition", points: 20 },
            { text: "Explain the role of intuition in professional decisions.", code: "", answer: "Rapid recognition based on experience, used alongside logic", points: 20 }
        ],
        "Advanced": [
            { text: "How do you prioritize decisions in a crisis?", code: "", answer: "Urgency and impact assessment (Triage)", points: 30 },
            { text: "What is Game Theory in decision making?", code: "", answer: "The study of mathematical models of strategic interaction among rational agents", points: 30 },
            { text: "Explain 'Bounded Rationality'.", code: "", answer: "The idea that decision-making is limited by available information and cognitive processing power", points: 30 },
            { text: "Strategic decision making in high-uncertainty environments.", code: "", answer: "Scenario planning and iterative learning", points: 30 },
            { text: "How do you lead ethical decision making in an organization?", code: "", answer: "Establishing clear values, frameworks, and accountability", points: 30 },
            { text: "What is Multi-Criteria Decision Analysis (MCDA)?", code: "", answer: "A sub-discipline of operations research that explicitly evaluates multiple conflicting criteria", points: 30 },
            { text: "How to minimize 'Decision Fatigue' in leadership?", code: "", answer: "Delegation, standardizing small choices, and making big decisions in the morning", points: 30 },
            { text: "Cognitive load theory in complex decision environments.", code: "", answer: "Designing processes to avoid overwhelming the decision-maker", points: 30 },
            { text: "Explain the 'Vroom-Yetton' decision model.", code: "", answer: "Situational leadership model used to decide how much to involve subordinates in decision-making", points: 30 },
            { text: "Systemic thinking in large-scale organizational decisions.", code: "", answer: "Considering the long-term impacts across the entire system", points: 30 }
        ]
    }
};

const seedQuestions = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to DB for seeding questions...');

        // Clear existing questions and challenges to avoid duplicates if re-run
        // WARNING: This is a seed script for a development environment.
        await client.query('DELETE FROM questions');
        await client.query('DELETE FROM challenges');

        for (const [skillName, levels] of Object.entries(questionsData)) {
            for (const [difficulty, questions] of Object.entries(levels)) {
                // Create a challenge for each skill + difficulty combo
                const challengeRes = await client.query(
                    'INSERT INTO challenges (title, description, type, difficulty) VALUES ($1, $2, $3, $4) RETURNING id',
                    [skillName, `${skillName} assessment for ${difficulty} level.`, skillName.toLowerCase().replace(' ', '_'), difficulty]
                );
                const challengeId = challengeRes.rows[0].id;

                for (const q of questions) {
                    await client.query(
                        'INSERT INTO questions (challenge_id, question_text, code_snippet, expected_answer, points) VALUES ($1, $2, $3, $4, $5)',
                        [challengeId, q.text, q.code, q.answer, q.points]
                    );
                }
            }
        }

        console.log('✅ Successfully seeded 180 questions across 18 challenges!');
    } catch (err) {
        console.error('Error seeding questions:', err);
    } finally {
        await client.end();
    }
};

seedQuestions();

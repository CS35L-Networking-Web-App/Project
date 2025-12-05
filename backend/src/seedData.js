import bcrypt from 'bcrypt';
import User from './models/user.js';
import Post from './models/post.js';

// used ChatGPT to generate JSON test data
const testUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
    position: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    about: 'Passionate about building scalable web applications and mentoring junior developers.',
    workExperience: 'Senior Software Engineer at Google (2020-2023)\nSoftware Engineer at Facebook (2018-2020)',
    education: 'BS in Computer Science, Stanford University',
    skills: 'JavaScript, React, Node.js, Python, MongoDB'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Password123!',
    position: 'Product Manager',
    location: 'New York, NY',
    about: 'Experienced product manager with a track record of launching successful B2B products.',
    workExperience: 'Product Manager at Microsoft (2019-2023)\nAssociate PM at Amazon (2017-2019)',
    education: 'MBA, Harvard Business School\nBS in Engineering, MIT',
    skills: 'Product Strategy, Agile, Data Analysis, Roadmapping'
  },
  {
    name: 'Carol Williams',
    email: 'carol@example.com',
    password: 'Password123!',
    position: 'UX Designer',
    location: 'Austin, TX',
    about: 'Creative designer focused on user-centered design and accessibility.',
    workExperience: 'Senior UX Designer at Airbnb (2021-2023)\nUX Designer at Dropbox (2019-2021)',
    education: 'BFA in Graphic Design, Rhode Island School of Design',
    skills: 'Figma, Sketch, User Research, Prototyping, Design Systems'
  },
  {
    name: 'David Chen',
    email: 'david@example.com',
    password: 'Password123!',
    position: 'Data Scientist',
    location: 'Seattle, WA',
    about: 'Machine learning enthusiast with expertise in natural language processing and computer vision.',
    workExperience: 'Data Scientist at Netflix (2020-2023)\nML Engineer at Tesla (2018-2020)',
    education: 'PhD in Computer Science, Carnegie Mellon University\nBS in Mathematics, UC Berkeley',
    skills: 'Python, TensorFlow, PyTorch, SQL, R, Deep Learning'
  },
  {
    name: 'Emma Davis',
    email: 'emma@example.com',
    password: 'Password123!',
    position: 'Marketing Director',
    location: 'Los Angeles, CA',
    about: 'Results-driven marketing professional specializing in digital campaigns and brand growth.',
    workExperience: 'Marketing Director at Nike (2021-2023)\nSenior Marketing Manager at Adidas (2018-2021)',
    education: 'MBA in Marketing, UCLA Anderson School of Management',
    skills: 'Digital Marketing, SEO, Content Strategy, Analytics, Brand Management'
  },
  {
    name: 'Frank Martinez',
    email: 'frank@example.com',
    password: 'Password123!',
    position: 'DevOps Engineer',
    location: 'Denver, CO',
    about: 'Cloud infrastructure expert passionate about automation and reliability engineering.',
    workExperience: 'DevOps Engineer at Spotify (2020-2023)\nSite Reliability Engineer at Twitter (2018-2020)',
    education: 'BS in Information Systems, University of Colorado',
    skills: 'Kubernetes, Docker, AWS, Terraform, CI/CD, Python, Bash'
  },
  {
    name: 'Grace Lee',
    email: 'grace@example.com',
    password: 'Password123!',
    position: 'Security Analyst',
    location: 'Boston, MA',
    about: 'Cybersecurity professional dedicated to protecting systems and educating teams about security best practices.',
    workExperience: 'Security Analyst at IBM (2019-2023)\nJunior Security Engineer at Cisco (2017-2019)',
    education: 'MS in Cybersecurity, Georgia Tech\nBS in Computer Engineering, MIT',
    skills: 'Penetration Testing, SIEM, Incident Response, Security Audits, Python'
  },
  {
    name: 'Henry Wilson',
    email: 'henry@example.com',
    password: 'Password123!',
    position: 'Full Stack Developer',
    location: 'Chicago, IL',
    about: 'Versatile developer who loves working across the entire stack and learning new technologies.',
    workExperience: 'Full Stack Developer at Stripe (2021-2023)\nBackend Developer at PayPal (2019-2021)',
    education: 'BS in Computer Science, University of Illinois',
    skills: 'TypeScript, React, Node.js, PostgreSQL, GraphQL, Redis'
  }
];

export async function seedTestData() {
  try {
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }

    console.log('Seeding test data...');

    const createdUsers = [];

    // Create test users
    for (const userData of testUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);

      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        position: userData.position,
        location: userData.location,
        about: userData.about,
        workExperience: userData.workExperience,
        education: userData.education,
        skills: userData.skills,
        isVerified: true
      });

      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create some sample posts
    const samplePosts = [
      {
        authorIndex: 0,
        text: 'Excited to share that I just completed a major refactoring project that improved our application performance by 40%! The key was implementing proper caching strategies and optimizing our database queries. Happy to discuss the approach with anyone interested!'
      },
      {
        authorIndex: 1,
        text: 'Just launched our new product feature today! It was a 6-month journey from concept to release. Big thanks to the amazing team that made this happen. Looking forward to seeing how our users engage with it.'
      },
      {
        authorIndex: 2,
        text: 'Finished conducting user research sessions for our new design system. The insights we gathered will help us create a more accessible and intuitive experience for all our users. User research is so valuable!'
      },
      {
        authorIndex: 3,
        text: 'Published a new research paper on transfer learning in computer vision! Proud to contribute to the ML community. Check it out and let me know your thoughts.'
      },
      {
        authorIndex: 4,
        text: 'Our recent campaign exceeded expectations with a 250% increase in engagement! Sometimes the simplest ideas have the biggest impact. The key was really understanding our audience.'
      }
    ];

    for (const postData of samplePosts) {
      await Post.create({
        author: createdUsers[postData.authorIndex]._id,
        text: postData.text
      });
    }

    // Seed some sample connections (mutual)
    const connectPairs = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4]
    ];

    for (const [a, b] of connectPairs) {
      const userA = createdUsers[a];
      const userB = createdUsers[b];
      userA.connections.push(userB._id);
      userB.connections.push(userA._id);
      await userA.save();
      await userB.save();
    }

    // Seed some pending connection requests
    const pendingPairs = [
      [5, 0], // Frank -> Alice
      [6, 1]  // Grace -> Bob
    ];
    for (const [fromIdx, toIdx] of pendingPairs) {
      const fromUser = createdUsers[fromIdx];
      const toUser = createdUsers[toIdx];
      toUser.connectionRequests.push({ from: fromUser._id });
      await toUser.save();
    }

    console.log(`Seeded ${createdUsers.length} users and ${samplePosts.length} posts`);
    console.log('Test users available with password: Password123!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

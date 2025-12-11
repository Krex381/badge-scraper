import { Client } from 'discord.js-selfbot-v13';
import fetch from 'node-fetch';
import readline from 'readline';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const COLORS = {
    reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
    cyan: '\x1b[36m', magenta: '\x1b[35m', yellow: '\x1b[33m',
    green: '\x1b[32m', red: '\x1b[31m'
};

const EMOJIS = {
    discord_employee: '<:discord_employee:1387742493046734979>',
    partnered_server_owner: '<:partnered_server_owner:1387742553394253834>',
    hypesquad_events: '<:hypesquad_events:1387742522545279056>',
    bughunter: '<:bughunter:1387742487690612887>',
    bughuntergold: '<:bughuntergold:1387742489338970123>',
    bravery: '<:bravery:1387742465544687707>',
    brilliance: '<:brilliance:1387742466697990285>',
    balance: '<:balance:1387742461014573058>',
    early_supporter: '<:early_supporter:1387742496796315779>',
    early_verified_bot_developer: '<:early_verified_bot_developer:1387742498226573342>',
    moderatorprogramsalumni: '<:moderatorprogramsalumni:1387742524105429032>',
    active_developer: '<:active_developer:1387742440697368606>',
    crown2: '<a:crown2:1413222572090331337>',
    idcard: '<:idcard:1413222293869432882>',
    world: '<:world:1413221837676220446>',
    lockk: '<:lockk:1413229832829014056>',
    badgespremium: '<:badgespremium:1413230008872210454>',
    cards: '<:cards:1413230537958625330>'
};

const BADGE_CONFIG = {
    DISCORD_EMPLOYEE: { emoji: EMOJIS.discord_employee, rare: true, name: 'Discord Employee' },
    PARTNERED_SERVER_OWNER: { emoji: EMOJIS.partnered_server_owner, rare: true, name: 'Partner' },
    HYPESQUAD_EVENTS: { emoji: EMOJIS.hypesquad_events, rare: true, name: 'HypeSquad Events' },
    BUGHUNTER_LEVEL_1: { emoji: EMOJIS.bughunter, rare: true, name: 'Bug Hunter' },
    BUGHUNTER_LEVEL_2: { emoji: EMOJIS.bughuntergold, rare: true, name: 'Bug Hunter Gold' },
    EARLY_SUPPORTER: { emoji: EMOJIS.early_supporter, rare: true, name: 'Early Supporter' },
    EARLY_VERIFIED_BOT_DEVELOPER: { emoji: EMOJIS.early_verified_bot_developer, rare: true, name: 'Verified Bot Dev' },
    DISCORD_CERTIFIED_MODERATOR: { emoji: EMOJIS.moderatorprogramsalumni, rare: true, name: 'Certified Mod' },
    HOUSE_BRAVERY: { emoji: EMOJIS.bravery, rare: false, name: 'HypeSquad Bravery' },
    HOUSE_BRILLIANCE: { emoji: EMOJIS.brilliance, rare: false, name: 'HypeSquad Brilliance' },
    HOUSE_BALANCE: { emoji: EMOJIS.balance, rare: false, name: 'HypeSquad Balance' },
    ACTIVE_DEVELOPER: { emoji: EMOJIS.active_developer, rare: false, name: 'Active Developer' }
};

const EMBED_COLORS = [0xFF1493, 0x9B59B6, 0x3498DB, 0xE91E63, 0x00CED1, 0xFF6B6B];
const FOOTER = { text: 'Nyx BadgeScraper', icon_url: 'https://media.discordapp.net/attachments/1402635989654044807/1409163724417142964/copy_8C70F144-386A-4CA9-B26A-E97A2A024890.gif' };

const prompt = (question) => new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
});

const log = (msg, color = '') => console.log(`${color}${msg}${COLORS.reset}`);

const getBadges = (member) => {
    const flags = member.user.flags?.toArray() || [];
    return flags.map(flag => BADGE_CONFIG[flag]).filter(Boolean);
};

const sendWebhook = async (url, embed) => {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (err) {
        log(`Webhook error: ${err.message}`, COLORS.red);
    }
};

const createEmbed = (user, rank) => {
    let desc = `${EMOJIS.crown2} **Rank #${rank}**\n\n${EMOJIS.idcard} **ID:** \`${user.id}\` | <@${user.id}>`;
    
    if (user.badges.length > 0) {
        const badges = user.badges.map(b => b.emoji).join(' ');
        const names = user.badges.map(b => b.name).join(', ');
        desc += `\n${EMOJIS.badgespremium} **Badges:** ${user.badges.length} (${user.rareCount} rare)\n${badges}\n\`${names}\``;
    }
    
    return {
        title: `${EMOJIS.cards} ${user.name}`,
        description: desc,
        color: EMBED_COLORS[Math.floor(Math.random() * EMBED_COLORS.length)],
        thumbnail: { url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` },
        footer: FOOTER,
        timestamp: new Date()
    };
};

(async () => {
    console.clear();
    log(`${COLORS.magenta}${COLORS.bright}Nyx BadgeScraper${COLORS.reset}\n`);

    const token = await prompt(`${COLORS.cyan}Token: ${COLORS.reset}`);
    const guildId = await prompt(`${COLORS.cyan}Server ID: ${COLORS.reset}`);
    const webhook = await prompt(`${COLORS.cyan}Webhook: ${COLORS.reset}`);

    const client = new Client({ checkUpdate: false });

    try {
        log('\nLogging in...', COLORS.cyan);
        await client.login(token);
        log(`✓ ${client.user.tag}\n`, COLORS.green);

        const guild = await client.guilds.fetch(guildId);
        log(`Fetching members from ${guild.name}...`, COLORS.cyan);
        const members = await guild.members.fetch();
        log(`✓ ${members.size} members\n`, COLORS.green);

        const rare = members.filter(m => getBadges(m).some(b => b.rare))
            .map(m => {
                const allBadges = getBadges(m);
                const rareBadges = allBadges.filter(b => b.rare);
                
                return {
                    name: m.user.globalName || m.user.username,
                    id: m.user.id,
                    avatar: m.user.avatar,
                    badges: allBadges,
                    rareCount: rareBadges.length
                };
            })
            .sort((a, b) => b.rareCount - a.rareCount);

        if (!rare.length) return log('No badges found', COLORS.yellow);

        log(`Found ${rare.length} users with badges\n`, COLORS.green);

        await sendWebhook(webhook, {
            title: `${EMOJIS.crown2} Scan Results`,
            description: `**Scanned:** \`${members.size}\`\n**With Badges:** \`${rare.length}\``,
            color: 0xFF1493,
            footer: FOOTER,
            timestamp: new Date()
        });

        for (const [i, user] of rare.entries()) {
            await sendWebhook(webhook, createEmbed(user, i + 1));
            log(`✓ ${user.name} (${user.rareCount})`, COLORS.green);
            await new Promise(r => setTimeout(r, 1000));
        }

        log(`\nComplete! Sent ${rare.length} profiles`, COLORS.green);
        client.destroy();

    } catch (err) {
        log(`Error: ${err.message}`, COLORS.red);
        await sendWebhook(webhook, {
            title: `${EMOJIS.lockk} Error`,
            description: `\`\`\`${err.message}\`\`\``,
            color: 0xFF0000,
            footer: FOOTER
        });
        client.destroy();
    }
})();

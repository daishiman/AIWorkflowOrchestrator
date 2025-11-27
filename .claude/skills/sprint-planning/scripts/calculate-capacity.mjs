#!/usr/bin/env node

import { parseArgs } from 'node:util';

function calculateCapacity(teamSize, sprintDays, options = {}) {
  const {
    hoursPerDay = 8,
    meetingsPerDay = 2,
    supportPerDay = 1.5,
    focusFactor = 0.7,
    availabilityRate = 0.95,
    hoursPerPoint = 3
  } = options;

  const effectiveHours = (hoursPerDay - meetingsPerDay - supportPerDay) * focusFactor;
  const individualCapacity = effectiveHours * sprintDays;
  const teamCapacity = individualCapacity * teamSize * availabilityRate;
  const storyPoints = Math.floor(teamCapacity / hoursPerPoint);

  return {
    individualHours: individualCapacity,
    teamHours: teamCapacity,
    storyPoints,
    buffer: Math.floor(storyPoints * 0.2),
    coreCommit: Math.floor(storyPoints * 0.8)
  };
}

function main() {
  const { values } = parseArgs({
    options: {
      'team-size': { type: 'string', short: 't' },
      'sprint-days': { type: 'string', short: 'd' },
      'focus-factor': { type: 'string', short: 'f' },
      help: { type: 'boolean', short: 'h' }
    }
  });

  if (values.help || !values['team-size'] || !values['sprint-days']) {
    console.log(`
Usage: node calculate-capacity.mjs --team-size <n> --sprint-days <n> [options]

Options:
  -t, --team-size <n>       Team size (number of people)
  -d, --sprint-days <n>     Sprint length in working days
  -f, --focus-factor <0-1>  Focus factor (default: 0.7)
  -h, --help                Show this help

Example:
  node calculate-capacity.mjs -t 5 -d 10
`);
    process.exit(values.help ? 0 : 1);
  }

  const teamSize = parseInt(values['team-size']);
  const sprintDays = parseInt(values['sprint-days']);
  const focusFactor = values['focus-factor'] ? parseFloat(values['focus-factor']) : 0.7;

  const result = calculateCapacity(teamSize, sprintDays, { focusFactor });

  console.log('\n='.repeat(60));
  console.log('📊 Sprint Capacity Calculation');
  console.log('='.repeat(60));
  console.log(`\nTeam Size: ${teamSize} people`);
  console.log(`Sprint Days: ${sprintDays} days`);
  console.log(`Focus Factor: ${focusFactor}`);
  console.log(`\n✅ Results:`);
  console.log(`  Individual Capacity: ${result.individualHours.toFixed(1)} hours`);
  console.log(`  Team Capacity: ${result.teamHours.toFixed(1)} hours`);
  console.log(`  Story Points: ${result.storyPoints} SP`);
  console.log(`  Core Commit (80%): ${result.coreCommit} SP`);
  console.log(`  Buffer (20%): ${result.buffer} SP`);
  console.log('\n' + '='.repeat(60));
}

main();

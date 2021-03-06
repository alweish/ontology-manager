// MIT License
//
// Copyright (c) 2018 Akash Kurdekar
// https://github.com/aceakash/string-similarity

export function compareTwoStrings (first, second) {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  // if both are empty strings
  if (!first.length && !second.length) {
    return 1
  }
  // if only one is empty string
  if (!first.length || !second.length) {
    return 0
  }
  // identical
  if (first === second) {
    return 1
  }
  // both are 1-letter strings
  if (first.length === 1 && second.length === 1) {
    return 0
  }
  // if either is a 1-letter string
  if (first.length < 2 || second.length < 2) {
    return 0
  }

  const firstBigrams = new Map()
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substr(i, 2)
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram) + 1
      : 1

    firstBigrams.set(bigram, count)
  };

  let intersectionSize = 0
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substr(i, 2)
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram)
      : 0

    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2)
}

export function findBestMatch (mainString, targetStrings) {
  if (!areArgsValid(mainString, targetStrings)) {
    throw new Error('Bad arguments: First argument should be a string, second should be an array of strings')
  }

  const ratings = []
  let bestMatchIndex = 0

  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i]
    const currentRating = compareTwoStrings(mainString, currentTargetString)
    ratings.push({ target: currentTargetString, rating: currentRating, index: i })
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i
    }
  }

  const bestMatch = ratings[bestMatchIndex]

  return { ratings, bestMatch, bestMatchIndex }
}

function areArgsValid (mainString, targetStrings) {
  if (typeof mainString !== 'string') {
    return false
  }
  if (!Array.isArray(targetStrings)) {
    return false
  }
  if (!targetStrings.length) {
    return false
  }
  if (targetStrings.find(s => typeof s !== 'string')) {
    return false
  }
  return true
}

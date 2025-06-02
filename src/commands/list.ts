// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { leetCodeExecutor } from "../leetCodeExecutor";
import { leetCodeManager } from "../leetCodeManager";
import { IProblem, ProblemState, UserStatus } from "../shared";
import * as settingUtils from "../utils/settingUtils";
import { DialogType, promptForOpenOutputChannel } from "../utils/uiUtils";


export async function listProblems(): Promise<IProblem[]> {
    try {
        if (leetCodeManager.getStatus() === UserStatus.SignedOut) {
            return [];
        }

        const useEndpointTranslation: boolean = settingUtils.shouldUseEndpointTranslation();
        let result = await leetCodeExecutor.listProblems(true, useEndpointTranslation);
        let resultEn = await leetCodeExecutor.listProblems(true,false);
        const reg: RegExp = /^(.)\s(.{1,2})\s(.)\s\[\s*(\d*)\s*\]\s*(.*)\s*(Easy|Medium|Hard)\s*\((\s*\d+\.\d+ %)\)/;
        let classic150Problems = [
            88,
            27,
            26,
            80,
            169,
            189,
            121,
            122,
            55,
            45,
            274,
            380,
            238,
            134,
            135,
            42,
            13,
            12,
            58,
            14,
            151,
            6,
            28,
            68,
            125,
            392,
            167,
            11,
            15,
            209,
            3,
            30,
            76,
            36,
            54,
            48,
            73,
            289,
            383,
            205,
            290,
            242,
            49,
            1,
            202,
            219,
            128,
            228,
            56,
            57,
            452,
            20,
            71,
            155,
            150,
            224,
            141,
            2,
            21,
            138,
            92,
            25,
            19,
            82,
            61,
            86,
            146,
            104,
            100,
            226,
            101,
            105,
            106,
            117,
            114,
            112,
            129,
            124,
            173,
            222,
            236,
            199,
            637,
            102,
            103,
            530,
            230,
            98,
            200,
            130,
            133,
            399,
            207,
            210,
            945,
            433,
            127,
            208,
            211,
            212,
            17,
            77,
            46,
            39,
            52,
            22,
            79,
            108,
            148,
            772,
            23,
            53,
            954,
            35,
            74,
            162,
            33,
            34,
            153,
            4,
            215,
            502,
            373,
            295,
            67,
            190,
            191,
            136,
            137,
            201,
            9,
            66,
            172,
            69,
            50,
            149,
            70,
            198,
            139,
            322,
            300,
            120,
            64,
            63,
            5,
            97,
            72,
            123,
            188,
            221
        ];
        let hot100Problems = [
            1,
            49,
            128,
            283,
            11,
            15,
            42,
            3,
            438,
            560,
            239,
            76,
            53,
            56,
            189,
            238,
            41,
            73,
            54,
            48,
            240,
            160,
            206,
            234,
            141,
            142,
            21,
            2,
            19,
            24,
            25,
            138,
            148,
            23,
            146,
            94,
            104,
            226,
            101,
            543,
            102,
            108,
            98,
            230,
            199,
            114,
            105,
            437,
            236,
            124,
            200,
            1036,
            207,
            208,
            46,
            78,
            17,
            39,
            22,
            79,
            131,
            51,
            35,
            74,
            34,
            33,
            153,
            4,
            20,
            155,
            394,
            739,
            84,
            215,
            347,
            295,
            121,
            55,
            45,
            768,
            70,
            118,
            198,
            279,
            322,
            139,
            300,
            152,
            416,
            32,
            62,
            64,
            5,
            1250,
            72,
            136,
            169,
            75,
            31,
            287
        ]
        const problems: IProblem[] = [];
        const linesEn: string[] = resultEn.split("\n");
        const enNameMap: { [key: string]: string } = {};
        for (const lineEn of linesEn) {
            const matchEn: RegExpMatchArray | null = lineEn.match(reg);
            if (matchEn && matchEn.length === 8) {
                const idEn: string = matchEn[4].trim();
                enNameMap[idEn] = matchEn[5].trim();
            }
        }
        const lines: string[] = result.split("\n");

        const { companies, tags } = await leetCodeExecutor.getCompaniesAndTags();
        for (const line of lines) {
            const match: RegExpMatchArray | null = line.match(reg);
            if (match && match.length === 8) {
                const id: string = match[4].trim();
                problems.push({
                    id,
                    isFavorite: match[1].trim().length > 0,
                    locked: match[2].trim().length > 0,
                    state: parseProblemState(match[3]),
                    isHot100: hot100Problems.includes(Number(id)),
                    isClassic150: classic150Problems.includes(Number(id)),
                    name: match[5].trim(),
                    nameEn: enNameMap[id] ,
                    difficulty: match[6].trim(),
                    passRate: match[7].trim(),
                    companies: companies[id] || ["Unknown"],
                    tags: tags[id] || ["Unknown"],
                });
            }
        }
        return problems.reverse();
    } catch (error) {
        await promptForOpenOutputChannel("Failed to list problems. Please open the output channel for details.", DialogType.error);
        return [];
    }
}

function parseProblemState(stateOutput: string): ProblemState {
    if (!stateOutput) {
        return ProblemState.Unknown;
    }
    switch (stateOutput.trim()) {
        case "v":
        case "✔":
        case "√":
            return ProblemState.AC;
        case "X":
        case "✘":
        case "×":
            return ProblemState.NotAC;
        default:
            return ProblemState.Unknown;
    }
}

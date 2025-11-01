export async function getOrCreateSport(db: any, sport_name: string): Promise<number> {
    // Check if sport exists
    const sportRow = await new Promise<any>((resolve, reject) => {
        db.get(
            `SELECT sport_id FROM sports WHERE sport_name = ?`,
            [sport_name],
            (err: any, row: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }
        );
    });

    if (sportRow) {
        return sportRow.sport_id;
    } else {
        // Insert new sport
        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run(
                `INSERT INTO sports (sport_name) VALUES (?)`,
                [sport_name],
                function (this: any, err: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ lastID: this.lastID });
                    }
                }
            );
        });
        return result.lastID;
    }
};

export async function getOrCreateTeam(db: any, team_name: string, team_city: string): Promise<number> {
    // Check if team exists
    const teamRow = await new Promise<any>((resolve, reject) => {
        db.get(
            `SELECT team_id FROM teams WHERE team_name = ? AND team_city = ?`,
            [team_name, team_city],
            (err: any, row: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }
        );
    });

    if (teamRow) {
        return teamRow.team_id;
    } else {
        // Insert new team
        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run(
                `INSERT INTO teams (team_name, team_city) VALUES (?, ?)`,
                [team_name, team_city],
                function (this: any, err: any) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ lastID: this.lastID });
                    }
                }
            );
        });
        return result.lastID;
    }
};
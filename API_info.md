# Health and Ready checks

- **Health check:**
    - *GET `${HOST}:${PORT}/health`* returns `{status: ok}` if service is running.
- **Ready check:**
    - *GET `${HOST}:${PORT}/ready`* returns `{status: ready}` if applications database is running.

# Team Info Routes

- **Getting list of all teams:**
    - *GET `${HOST}:${PORT}/info/teams`* returns an array of json objects structured as following
    ```js
    {
        team_id: number,
        team_name: string,
        team_city: string
    }[]
    ```
    - **Error: returns 404 in case of error.**
- **Getting team info by team_id:**
    - *GET `${HOST}:${PORT}/info/teams/:teamId`* returns a json object of a team with a matching team_id from the database as following
    ```js
    {
        team_id: number,
        team_name: string,
        team_city: string
    }
    ```
    - **Error:** 
        - **returns 400 if provided parameter is NaN or negative number.**
        - **returns 404 if team not found.**

- **Getting team infos by team_name:**
    - *GET `${HOST}:${PORT}/info/teams/search/name/:teamName`* returns an array of team json objects with matching team names. (`Real` as a parameter will return all team objects that have `Real` in their name).
    - **Error:** 
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if not found.**

-  **Getting team infos by team_city:**
    - *GET `${HOST}:${PORT}/info/teams/search/city/:cityName`* returns an array of team json objects with matching city names. (`Los Angeles` as a parameter will return Lakers, Giants, Clippers, etc.)
    - **Error:**
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if not found**

- **Adding new team to a database:**
    - *POST `${HOST}:${PORT}/info/teams` with a json object in its body given as
    ```js
    {
        team_name: "Lakers",
        city: "Los Angeles"
    }
    ```
    - **Upon successful addition of team client receives 201 with a json object `{message: 'Team added successfully', teamId: 123}.**`
    - **Error:**
        - **returns 400 on a bad request body. (Missing/invalid fields)**
        - **returns 500 upon Database error or 409 upon violation of UNIQUE constraint**
